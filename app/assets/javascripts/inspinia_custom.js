// minimize navbar click
$(document).ready(() => {
  // routing

  // links logic, need to find where ajax fires and fix it

  $("a").click(e => {
    if (!$(e.currentTarget).data("remote")) {
      e.preventDefault();
      if (e.currentTarget.href) {
        if (e.ctrlKey) {
          window.open(e.currentTarget.href, "_blank");
        } else {
          location.href = e.currentTarget.href;
        }
      }
    }
  });

  //

  // minimize button

  $("#minimize_navbar_btn").click(() => {
    if (!$("body").hasClass("mini-navbar")) {
      $("#head_wrapper").removeClass("width96");
      $("#head_wrapper").addClass("width88");
      $("#topnavbar_wrapper").removeClass("width96");
      $("#topnavbar_wrapper").addClass("width88");
    } else {
      $("#head_wrapper").removeClass("width88");
      $("#head_wrapper").addClass("width96");
      $("#topnavbar_wrapper").removeClass("width88");
      $("#topnavbar_wrapper").addClass("width96");
    }
    $.post({
      url: location.origin + "/custom_settings/change",
      data: { setting: "minimize_navbar" }
    });
  });

  //
});
