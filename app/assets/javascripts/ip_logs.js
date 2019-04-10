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
});

const ip_logs_events = () => {
  $("[id=item_name]")
    .unbind("click")
    .click(e => {
      const target = e.target;
      const map_name = $(target).data("map-name");
      const focus_item_id = $(target).data("item-id");
      location.href = `${
        location.origin
      }/maps?map=${map_name}&focus_item_id=${focus_item_id}`;
    });

  $("[id=item_name_copy_button]")
    .unbind("click")
    .click(e => {
      copy_to_clipboard($(e.target).data("item-name"));
    });

  $("[id=ip_address]")
    .unbind("click")
    .click(e => {
      window.open(`http://${e.target.textContent.trim()}`, "_blank");
    });

  $("[id=ip_address_copy_button]")
    .unbind("click")
    .click(e => {
      copy_to_clipboard($(e.target).data("ip-address"));
    });
};
