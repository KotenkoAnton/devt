$(document).ready(() => {
  $('[data-toggle="tooltip"]').tooltip();

  $("[id=map_list_link_button]").click(e => {
    window.location.href = `${window.location.origin}/maps?map=${
      e.target.textContent
    }`;
  });

  $(".delete-map-icon").click(e => {
    const deleteMapCallback = res => {
      if (res.deleted) {
        location.reload();
      } else {
        $("#unsuccessDelete").modal();
      }
    }

    $.post({
      url: `${location.origin}/api/maps/delete_map`,
      data: { map_id: $(e.currentTarget).data("map-id") },
      success: deleteMapCallback
    })
  });
});
