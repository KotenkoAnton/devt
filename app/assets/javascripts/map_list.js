$(document).ready(() => {
  $("[id=map_list_link_button]").click(e => {
    window.location.href = `${window.location.origin}/maps?map=${
      e.target.textContent
    }`;
  });
});
