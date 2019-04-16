$(document).ready(() => {
  $("#extended_search_type").multiselect({
    numberDisplayed: 7
  });
  let table;
  const columns = { name: 0, ip: 1, type: 2, address: 3 };
  const table_options = {
    aaSorting: [],
    deferRender: true,
    iDisplayLength: 50,
    columnDefs: [
      {
        targets: columns.name,
        render: data => `<span class="name-link">${data}</span>`
      },
      {
        targets: columns.ip,
        render: data => `<span class="ip-link">${data}</span>`
      }
    ],

    createdRow: (row, data, index) => {
      let name_span = $(row)
        .find(`td:eq(${columns.name})`)
        .find("span");
      $(name_span).attr("data-item-id", data.item_id);
      $(name_span).attr("data-map-name", data.map_name);
    }
  };
  $.get({
    url: `${location.origin}/extended_search/fetch_devices`,
    success: data => {
      table_options.data = data["devices"];
      table = $("#extended_search_table").DataTable(table_options);
    }
  });

  $("#extended_search_table tbody").on("click", "span", e => {
    const target = e.currentTarget;
    if ($(target).hasClass("name-link")) {
      const map_name = $(target).data("map-name");
      const focus_item_id = $(target).data("item-id");
      location.href = `${
        location.origin
      }/maps?map=${map_name}&focus_item_id=${focus_item_id}`;
    } else if ($(target).hasClass("ip-link")) {
      window.open(`http://${target.textContent.trim()}`, "_blank");
    }
  });

  $("#extended_search_btn").click(() => {
    table.columns(columns.name).search($("#extended_search_name").val());
    table.columns(columns.ip).search($("#extended_search_ip").val());
    const types = $("#extended_search_type").val();
    if (types && types.lenght != 0) {
      table.columns(columns.type).search(types.join("|"), true, false);
    } else {
      table.columns(columns.type).search("");
    }
    table.columns(columns.address).search($("#extended_search_address").val());
    table.draw();
  });
});
