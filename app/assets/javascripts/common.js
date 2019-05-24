// search
$(document).ready(() => {
  let timeout;
  $("#search").keyup(() => {
    if ($("#search").val()) {
      $("#search_empty_button").show();
    } else {
      $("#search_empty_button").hide();
    }
    search();
  });

  $("#search").focus(() => {
    if ($("#search").val().length > 2) {
      search();
    }
  });

  $("#search_empty_button").click(() => {
    $("#search").val("");
    $("#search_empty_button").hide();
  });

  let search = () => {
    let filter = $("#search").val();
    if (filter.length < 3) {
      return;
    }
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      const find_items = (search_str, success = null) => {
        $.get({
          url: `${location.origin}/api/maps/find_items`,
          data: { search_str },
          success: success
        });
      };

      find_items(filter, data => {
        if (data.search_str != $("#search").val()) {
          return;
        }
        $("#search_box").css("display", "block");
        let html = "";
        data.items.forEach(item => {
          item.name += ` (${item.placeable.ip_address.ip_address})`;
          html += `
            <div data-item-id="${item.id}" data-map-name=${
            item.map.name
          } class="search-row">
              ${item.name.replace(
                new RegExp(data.search_str, "ig"),
                "<span>$&</span>"
              )}
              <div class="host-type-name-icon-wrapper">
                ${get_icon_for_action_box(item.placeable.host_type_name)}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg">
                <circle cx="5" cy="5" r="5" fill=${
                  item.placeable.ip_address.icmp_available ? "green" : "red"
                }/>
              </svg>
              <hr>
            </div>
          `;
        });
        $("#search_box").html(html);
        $(".search-row").click(event => {
          window.location.href = `${location.origin}/maps?map=${$(
            event.currentTarget
          ).data("map-name")}&focus_item_id=${$(event.currentTarget).data(
            "item-id"
          )}&search_str=${data.search_str}`;
        });
      });
    }, 600);
  };

  window.onclick = event => {
    if (!$(event.target).closest(".search-box,.search-row").length) {
      $("#search_box").css("display", "none");
    }
  };
});
