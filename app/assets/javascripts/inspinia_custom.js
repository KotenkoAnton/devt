// minimize navbar click
$(document).ready(() => {
  // routing

  $("#logs_link").click(() => {
    location.href = `${location.origin}/ip_logs`;
  });
  $("[id=origin_page_link]").click(() => {
    location.href = location.origin;
  });

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
