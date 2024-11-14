var m_icon_1 = document.querySelector("#icon_1");
var icon_1 = document.querySelector(".icon_1");
var m_icon_4 = document.querySelector("#icon_4");
var icon_4 = document.querySelector(".icon_4");


m_icon_1.onmouseenter = () =>{
    icon_1.setAttribute("trigger","loop");
    m_icon_1.style.cursor = "pointer";
    setTimeout(() => {
        icon_1.setAttribute("trigger","");
    }, 1000);
}


m_icon_4.onmouseenter = () =>{
    icon_4.setAttribute("trigger","loop");
    m_icon_4.style.cursor = "pointer";
    setTimeout(() => {
        icon_4.setAttribute("trigger","");
    }, 1000);
}


// li:2 Navbar & Sub-bar

var sub_list = document.querySelector("#sub_list");
var drop_img = document.querySelector(".drop_img");

m_icon_4.onclick = () =>{
    setTimeout(() => {
        sub_list.style.pointerEvents = "fill";
    }, 100);
    setTimeout(() => {
        drop_img.style.transform = 'rotoateZ(-180deg)';
        sub_list.style.opacity = "1";
    }, 200);
}

m_icon_4.onmouseleave = () =>{
    setTimeout(() => {
        drop_img.style.transform = 'rotoateZ(0deg)';
        sub_list.style.pointerEvents = "none";
        sub_list.style.opacity = "0";
    }, 100);
}



// File Validation --

var file_box = document.querySelector("#get_image");
var error = document.querySelector(".error_indicator");
var confirm_btn = document.querySelector(".cnfrm_btn");
var close = document.querySelector(".close_box");
var img_name = document.querySelector(".img_name");


var checker = 0;

function validateFile(){
    const allowedExtensions =  ['jpg','jpeg','png'],
          sizeLimit = 1_500_000; // 1 megabyte
  
    const { name:fileName, size:fileSize } = this.files[0];
    const fileExtension = fileName.split(".").pop();

    if(!allowedExtensions.includes(fileExtension)){
        confirm_btn.addEventListener("click",function (e) {
            e.preventDefault();
        })

        error.style.marginTop = "10px";
        error.innerHTML = 'file type not allowed, select only image file.<span class="close_box"><img src="resorces/other/cancel.png"></span>';
        this.value = null;
        
        setTimeout(() => {
            error.style.marginTop = "-50px";
        }, 5000);

        img_name.innerText = "";
        checker = 0;
    }
    else if(fileSize > sizeLimit){
        confirm_btn.addEventListener("click",function (e) {
            e.preventDefault();
        })

        error.style.marginTop = "10px";
        error.innerHTML = 'image size must be less then &lt; 1.5MB.<span class="close_box"><img src="resorces/other/cancel.png"></span>';
        this.value = null;

        setTimeout(() => {
            error.style.marginTop = "-50px";
        }, 5000);

        img_name.innerText = "";
        checker = 0;
    }
    else{
        confirm_btn.addEventListener("click",function (e) {
            e.stopPropagation();
        })
        img_name.innerText = fileName;
         checker = 1;
    }
}



// Main Catlog prototype --


var catlog_box = document.querySelector(".catlog_section-1");

confirm_btn.onclick = (e) =>{
    if(checker == 0){
        e.preventDefault();

        error.style.marginTop = "10px";
        error.innerHTML = 'please select a image file.<span class="close_box"><img src="resorces/other/cancel.png"></span>';
        setTimeout(() => {
            error.style.marginTop = "-50px";
        }, 5000);
    }
    else if(checker == 1){
        e.preventDefault();
        catlog_box.style.marginLeft = "-50%";
    }
}


file_box.addEventListener("change", validateFile);


// --------- Input Date & Time --

var time_field = document.querySelector("#date_Time")
setInterval(() => {
var currentDate = new Date().toLocaleString();
    time_field.value = currentDate;    
}, 500);


// --------- Sub Wallet box -- 

var pymt_opt_3 = document.querySelector(".pymt-opt-3");
var pymt_opt_4 = document.querySelector(".pymt-opt-4");
var subPymt_box = document.querySelector("#sub_pymt_boxes");

var walt_1 = document.querySelector(".wallet-1");
var walt_2 = document.querySelector(".wallet-2");
var walt_3 = document.querySelector(".wallet-3");

var arrow_down_img = document.querySelector(".arrow_down_img");

var toggle = 0;
pymt_opt_3.addEventListener("click",function(){
    if(toggle == 0){
        pymt_opt_4.style.marginTop = "110px";
        subPymt_box.style.transform = "scaleY(1)";
        arrow_down_img.style.transform = "rotateZ(180deg)";

        setTimeout(() => {
            walt_1.style.opacity = "1";
            walt_2.style.opacity = "1";
            walt_3.style.opacity = "1";
        }, 100);
        toggle = 1;
    }
    else if(toggle == 1){
   
        setTimeout(() => {
            pymt_opt_4.style.marginTop = "5px";
            subPymt_box.style.transform = "scaleY(0)";
            arrow_down_img.style.transform = "rotateZ(0deg)";
        }, 100);

        setTimeout(() => {
            walt_1.style.opacity = "0";
            walt_2.style.opacity = "0";
            walt_3.style.opacity = "0";
        }, 50);
        toggle = 0;
    }
})


// Sub Location Box --


var main_Location = window.localStorage.getItem("UserLocation");
var subLocationBox = document.querySelector("#pac-input");

window.onload = () =>{
    subLocationBox.value = main_Location;
}


// -- Billing Section -- 

var amount_box = document.querySelector(".amount_part");
var billing_head_indicator = document.querySelector(".billing_head_indicator");
var billing_amount = document.querySelector(".billing_amount");

var total_amnt = document.querySelector("#totalAmont");
var del_chrgs = document.querySelector("#delvry_chrgs");
var totalRoundValue = document.querySelector("#totalRoundValue");

var gst_chrgs = document.querySelector("#gst_chrgs");
var gst_value;

var totalRoundOff = document.querySelector("#totalRoundOff");

var main_box_2 = document.querySelector("#m_Box-2");
var main_billing_section = document.querySelector(".main_billing_section");

// Cupon Section ---
var coupon = document.querySelector(".coupon");
var cupnbx_1 = document.querySelector(".cupnbx-1");
var cupn_name = document.querySelector(".cupn_name");
var cupon_box = document.querySelector("#cupon_box");

setInterval(() => {
    if(billing_amount.innerText != "" && billing_amount.innerText != "0"){
        amount_box.style.animationPlayState = "paused";
        amount_box.style.filter = "brightness(110%)";
        
        billing_head_indicator.innerText = "";
        billing_head_indicator.innerText = "Total Amount - "; 

        /*-- Main Calcultion--*/

        total_amnt.innerText = billing_amount.innerText;
        gst_chrgs.innerText = gst_value;
        del_chrgs.innerText = "30";

        var amount_value = billing_amount.innerText;
        var del_value = del_chrgs.innerText;

        if(parseInt(amount_value) < 600){
            gst_value = parseInt(amount_value) * 7 / 100;
        }
        else if(parseInt(amount_value) > 600){
            gst_value = parseInt(amount_value) * 4 / 100;
        }

        var result_value = parseInt(amount_value) + parseInt(del_value) + parseInt(gst_value);

        totalRoundValue.innerText = result_value;
        totalRoundOff.innerText =  totalRoundValue.innerText;

            // ----------------- //

        if(cupon_box.value != ""){
            if(result_value < 500){
                cupn_name.innerText = "Not Applied";
                cupn_name.style.color = "red";

                cupnbx_1.style.marginTop = "-10px";
            }
            else if(result_value > 500){
                cupn_name.innerText = cupon_box.value;
                cupn_name.style.color = "green";

                cupnbx_1.style.paddingTop = "0px";
            }
            clear_cupn_section.style.opacity = "1";
            clear_cupn_section.style.pointerEvents = "fill";
        }
        else if(cupon_box.value.length < 1){
            clear_cupn_section.style.opacity = "0";
            clear_cupn_section.style.pointerEvents = "none";
        }


        //--------------------//

        main_billing_section.style.pointerEvents = "fill";
        main_box_2.style.pointerEvents = "fill";

        setTimeout(() => {
            amount_box.style.opacity = "0";
            amount_box.style.pointerEvents = "none";
        }, 5000);
    }
}, 100);



var clear_cupn_section = document.querySelector(".clear_cupn_section");
clear_cupn_section.onclick = () =>{
    cupon_box.value = "";
    cupn_name.innerText = "";
    cupnbx_1.style.paddingTop = "25px";
    clear_cupn_section.style.opacity = "0";
    clear_cupn_section.style.pointerEvents = "none";
}

var cupon_box = document.querySelector("#cupon_box");
cupon_box.addEventListener("keydown",function (event) {
    event.preventDefault();
})





