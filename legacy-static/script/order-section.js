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



// Track Bar Progress --

var indicator_1 = document.querySelector(".indicator-1");
var indicator_2 = document.querySelector(".indicator-2");
var indicator_3 = document.querySelector(".indicator-3");
var indicator_4 = document.querySelector(".indicator-4");

var img_1 = document.querySelector(".img_detail-1");
var img_2 = document.querySelector(".img_detail-2");
var img_3 = document.querySelector(".img_detail-3");
var img_4 = document.querySelector(".img_detail-4");

var blink_1 = document.querySelector(".blink-1");
var blink_2 = document.querySelector(".blink-2");
var blink_3 = document.querySelector(".blink-3");
var blink_4 = document.querySelector(".blink-4");

var blink_child_1 = document.querySelector(".child-1");
var blink_child_2 = document.querySelector(".child-2");
var blink_child_3 = document.querySelector(".child-3");
var blink_child_4 = document.querySelector(".child-4");

var path = document.querySelector(".current_status");;
var end_track = document.querySelector(".end_track");


function orderTrack_path(){
    if(fetch_status.value == 'Order Placed'){
        blink_1.style.backgroundColor = "#000";
        blink_1.style.height = "22px";
        blink_1.style.width = "22px";
        img_1.style.filter = " grayscale(0%)";
        
        blink_child_1.style.animationPlayState = "running";
    }
    else if(fetch_status.value == "Processing"){
        blink_1.style.backgroundColor = "#000";
        blink_1.style.height = "22px";
        blink_1.style.width = "22px";
        img_1.style.filter = " grayscale(0%)";
        
        blink_2.style.backgroundColor = "#000";
        blink_2.style.height = "22px";
        blink_2.style.width = "22px";
        indicator_1.style.borderLeft = "4px solid #30e849";
        img_2.style.filter = " grayscale(0%)";

        blink_child_1.style.animationPlayState = "paused";
        blink_child_2.style.animationPlayState = "running";
    }
    else if(fetch_status.value == "Out For Delivery"){
        blink_1.style.backgroundColor = "#000";
        blink_1.style.height = "22px";
        blink_1.style.width = "22px";
        img_1.style.filter = " grayscale(0%)";
        
        blink_2.style.backgroundColor = "#000";
        blink_2.style.height = "22px";
        blink_2.style.width = "22px";
        indicator_1.style.borderLeft = "4px solid #30e849";
        img_2.style.filter = " grayscale(0%)";

        blink_3.style.backgroundColor = "#000";
        blink_3.style.height = "22px";
        blink_3.style.width = "22px";
        indicator_2.style.borderLeft = "4px solid #30e849";
        img_3.style.filter = " grayscale(0%)";

        blink_child_1.style.animationPlayState = "paused";
        blink_child_2.style.animationPlayState = "paused";
        blink_child_3.style.animationPlayState = "running";
    }
    else if(fetch_status.value == "Delivered"){
        blink_1.style.backgroundColor = "#000";
        blink_1.style.height = "22px";
        blink_1.style.width = "22px";
        img_1.style.filter = " grayscale(0%)";
        
        blink_2.style.backgroundColor = "#000";
        blink_2.style.height = "22px";
        blink_2.style.width = "22px";
        indicator_1.style.borderLeft = "4px solid #30e849";
        img_2.style.filter = " grayscale(0%)";

        blink_3.style.backgroundColor = "#000";
        blink_3.style.height = "22px";
        blink_3.style.width = "22px";
        indicator_2.style.borderLeft = "4px solid #30e849";
        img_3.style.filter = " grayscale(0%)";

        blink_4.style.backgroundColor = "#000";
        blink_4.style.height = "22px";
        blink_4.style.width = "22px";
        indicator_3.style.borderLeft = "4px solid #30e849";
        img_4.style.filter = " grayscale(0%)";
        
        blink_child_1.style.animationPlayState = "paused";
        blink_child_2.style.animationPlayState = "paused";
        blink_child_3.style.animationPlayState = "paused";
        blink_child_4.style.animationPlayState = "running";

        setTimeout(() => {
            indicator_4.style.borderLeft = "4px solid #30e849";
            setTimeout(() => {
                end_track.style.opacity = "1";
                blink_child_4.style.animationPlayState = "paused";
            }, 2000);
        }, 4000);
    }
}


setInterval(() => {
   orderTrack_path();
}, 100);




// Send satuts to track bar--

var current_path = document.querySelector(".current_status")
var child_box = document.querySelector(".child-box");
var fetch_status = document.querySelector(".check_order_status_");
var mask = document.querySelector("#track_mask");

child_box.onclick = () =>{
    var get_result = current_path.innerText;
    mask.style.opacity = "1";
    mask.style.zIndex = "5";

    fetch_status.value = get_result; 
    mask.innerText = "Please Wait";
    mask.style.animationPlayState = "running";

   setTimeout(() => {
        mask.style.opacity = "0";
        mask.style.zIndex = "-5";
   }, 2500);
}




// Cancel Button --

var res_message_final = document.querySelector(".res_message");

res_message_final.onmouseenter = () =>{
    alert('Currenty We Are Not Providing This Service'); 
}




// var i;



// function get_status(){
//     for (i = 0; i < child_box.length; i++) {
//         var a = i;
//       console.log(current_path[a].innerText);
//       child_box[a].onclick = () =>{
//         console.log(current_path[a].innerText)
//       }
//     }
// }


// get_status()





