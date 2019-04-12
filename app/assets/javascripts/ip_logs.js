// this vars help determine whether we need to load another page or not
let next_page = 2;
let lock = false;

const copy_to_clipboard = text => {
  const text_input = $("<input></input>");
  text_input.val(text);
  $("#minimize_navbar_btn").append(text_input);
  text_input.focus();
  text_input.select();
  document.execCommand("copy");
  text_input.remove();
};

$(document).ready(() => {
  ip_logs_events();
  load_logs_if_need();
});

const _set_log_events = page => {
  $(`[id=item_name][data-page=${page}]`).click(e => {
    const target = e.target;
    const map_name = $(target).data("map-name");
    const focus_item_id = $(target).data("item-id");
    location.href = `${
      location.origin
    }/maps?map=${map_name}&focus_item_id=${focus_item_id}`;
  });

  $(`[id=item_name_copy_button][data-page=${page}]`).click(e => {
    copy_to_clipboard($(e.target).data("item-name"));
  });

  $(`[id=ip_address][data-page=${page}]`).click(e => {
    window.open(`http://${e.target.textContent.trim()}`, "_blank");
  });

  $(`[id=ip_address_copy_button][data-page=${page}]`).click(e => {
    copy_to_clipboard($(e.target).data("ip-address"));
  });
};

const ip_logs_events = () => {
  _set_log_events(1);

  $(window).scroll(() => {
    load_logs_if_need();
  });
};

const load_logs_if_need = () => {
  const document_height = $(document).height();
  const screen_height = $(window).height();
  const scroll_top = $(window).scrollTop();

  if (
    (scroll_top > (document_height - screen_height) / 1.3 && !lock) ||
    ($(window).scrollTop() == 0 && $(document).height() == $(window).height())
  ) {
    lock = true;
    if (next_page != 0) {
      $.get({
        url: `${location.origin}/ip_logs/fetch_page`,
        data: { page: next_page },
        success: data => {
          const ip_logs = data.ip_logs;
          const green_circle = `
            <span class="ip-active">Active</span>
            <svg xmlns="http://www.w3.org/2000/svg">
              <circle cx="5" cy="5" r="5" fill="green"/>
            </svg>`;
          const red_circle = `
            <span class="ip-not-active">Not active</span>
            <svg xmlns="http://www.w3.org/2000/svg">
              <circle cx="5" cy="5" r="5" fill="red"/>
            </svg>`;
          let ip_logs_html = "";
          ip_logs.forEach(ip_log => {
            let names = "";
            ip_log.ip_address.devices.forEach(device => {
              names += `
                <span class="log-link-wrapper">
                  <span id="item_name" data-page="${next_page}" class="log-link" data-item-id="${
                device.item.id
              }" data-map-name="${device.item.map.name}">
                    ${device.item.name}
                  </span>
                  <i id="item_name_copy_button" data-page="${next_page}" class="fa fa-copy copy-btn" data-item-name="${
                device.item.name
              }"></i>
                </span>
              `;
            });
            ip_logs_html += `
              <tr>
                <td>
                  ${names}
                </td>
                <td>
                  <span class="log-link-wrapper">
                    <span id="ip_address" data-page="${next_page}" class="log-link">
                      ${ip_log.ip_address.ip_address}
                    </span>
                    <i id="ip_address_copy_button" data-page="${next_page}" class="fa fa-copy copy-btn" data-ip-address="${
              ip_log.ip_address.ip_address
            }"></i>
                  </span>
                </td>
                <td>
                  <span class="status-wrapper">
                    ${ip_log.status == "up" ? green_circle : red_circle}
                  </span>
                </td>
                <td>${ip_log.status}</td>
                <td>${ip_log.created_at}</td>
              </tr>
            `;
          });
          $("#table_body tr:last")
            .after(ip_logs_html)
            .promise()
            .done(() => {
              _set_log_events(next_page);
              next_page++;
              lock = false;
              if (data.ip_logs.length == 0) {
                next_page = 0;
                return;
              }
              load_logs_if_need();
            });
        }
      });
    }
  }
};
