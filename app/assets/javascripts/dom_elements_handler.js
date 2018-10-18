class DomElementsHandler {
  open_box(item) {
    let info_box_html = `
      <div id='info_box' class='container'>
        <div class='item-name'>Bolshoy_Dipol_RM5</div>
        <hr class='info-box-delimiter'>
        <div class='info-label'>Hostname:</div>
        <div class='info-text'>192.168.109.254</div><br>
        <div class='info-label'>Address:</div>
        <div class='info-text'>192.168.109.254</div><br>
        <div class='info-label'>Up since:</div>
        <div class='info-text'>08/28/18 20:25:29</div><br>
        <div class='info-label'>Responded:</div>
        <div class='info-text'>98.13%</div><br>
        <div class='info-label'>Status:</div>
        <div class='info-text green-status'>Active and responding</div><br>
        <hr class='info-box-delimiter'>
        <div class='info-label'>20180828 202618 UP</div>
        <div class='info-label'>20180828 202618 DOWN</div>
        <div class='info-label'>20180828 202618 UP</div>
        <div class='info-label'>20180828 202618 DOWN</div>
        <div class='info-label'>20180828 202618 UP</div>
        <div class='open-button'>
          <div class='open-button-text'>Перейти</div>
        </div>
        <div class='unlink-button'>
          <img src='assets/unlink_button.svg'>
        </div>
        <div class='copy-button'>
          <img src='assets/copy_button.svg'>
        </div>
        <div class='delete-button'>
          <img src='assets/delete_button.svg'>
        </div>
      </div>
    `;
    $("#canvas").after(info_box_html);
    $("#info_box").css({
      top: item.position.y - 65,
      left: item.position.x + 45
    });
  }

  close_box() {
    $("#info_box").remove();
  }
}
