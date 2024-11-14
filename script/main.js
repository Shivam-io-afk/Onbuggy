// Icon's Animation ----

var m_icon_1 = document.querySelector("#icon_1");
var icon_1 = document.querySelector(".icon_1");
var m_icon_2 = document.querySelector("#icon_2");
var icon_2 = document.querySelector(".icon_2");
var m_icon_3 = document.querySelector("#icon_3");
var icon_3 = document.querySelector(".icon_3");
var m_icon_4 = document.querySelector("#icon_4");
var icon_4 = document.querySelector(".icon_4");
var m_icon_5 = document.querySelector("#icon_5");
var icon_5 = document.querySelector(".icon_5");
var m_icon_6 = document.querySelector(".m_icon_6");
var icon_6 = document.querySelector(".icon_6");



m_icon_1.onmouseenter = () =>{
    icon_1.setAttribute("trigger","loop");
    setTimeout(() => {
        icon_1.setAttribute("trigger","");
    }, 1000);
}

m_icon_2.onmouseenter = () =>{
    icon_2.setAttribute("trigger","loop");
    setTimeout(() => {
        icon_2.setAttribute("trigger","");
    }, 500);
}

m_icon_3.onmouseenter = () =>{
    icon_3.setAttribute("trigger","loop");
    setTimeout(() => {
        icon_3.setAttribute("trigger","");
    }, 300);
}

m_icon_4.onmouseenter = () =>{
    icon_4.setAttribute("trigger","loop");
    setTimeout(() => {
        icon_4.setAttribute("trigger","");
    }, 1000);
}

m_icon_5.onmouseenter = () =>{
    icon_5.setAttribute("trigger","loop");
    setTimeout(() => {
        icon_5.setAttribute("trigger","");
    }, 500);
}

m_icon_6.onclick = () =>{
    icon_6.setAttribute("trigger","loop");
    setTimeout(() => {
        icon_6.setAttribute("trigger","");
    }, 500);
}



// Slider Animation ----

var slider_background = document.querySelector("#slider");
var slide_box_left = document.querySelector(".side_left");
var slide_box_right = document.querySelector(".side_right");

var sl_box_1 = document.querySelector(".box_1");
var sl_box_2 = document.querySelector(".box_2");
var sl_box_3 = document.querySelector(".box_3");
var sl_box_4 = document.querySelector(".box_4");
var sl_box_5 = document.querySelector(".box_5");
var sl_box_6 = document.querySelector(".box_6");



// Wave --

var color_1 = document.querySelector("#color-1");
var color_2 = document.querySelector("#color-2");


// Main Funtioning --

var slider_num = 1;

function slider_animation(){
    slider_num++;
    if(slider_num == 2){ // Grocery's
        slide_box_left.style.marginTop = "0";
        slide_box_right.style.marginTop = "0";
        sl_box_2.style.opacity = "1";
        sl_box_5.style.opacity = "1";

        sl_box_1.style.opacity = "0";
        sl_box_3.style.opacity = "0";
        sl_box_4.style.opacity = "0";
        sl_box_6.style.opacity = "0";
        slider_background.style.backgroundColor = "skyblue";
         
        color_1.setAttribute("stop-color","skyblue");
        color_2.setAttribute("stop-color","skyblue");
    }
    else if(slider_num == 3){ // Vegetable's
        slide_box_left.style.marginTop = "-7%";
        slide_box_right.style.marginTop = "8%";
       setTimeout(() => {
            sl_box_3.style.opacity = "1";
            sl_box_4.style.opacity = "1";
       }, 150);

        sl_box_2.style.opacity = "0";
        sl_box_1.style.opacity = "0";
        sl_box_5.style.opacity = "0";
        sl_box_6.style.opacity = "0";
        slider_background.style.backgroundColor = "chartreuse"; 

        color_1.setAttribute("stop-color","chartreuse");
        color_2.setAttribute("stop-color","chartreuse");
    }
    else if(slider_num == 4){ // Medicine's
        slide_box_left.style.marginTop = "7%";
        slide_box_right.style.marginTop = "-8%";
      setTimeout(() => {
            sl_box_1.style.opacity = "1";
            sl_box_6.style.opacity = "1";
       }, 380);

        sl_box_2.style.opacity = "0";
        sl_box_3.style.opacity = "0";
        sl_box_5.style.opacity = "0";
        sl_box_4.style.opacity = "0";

        slider_background.style.backgroundColor = "orangered"; 

        color_1.setAttribute("stop-color","orangered");
        color_2.setAttribute("stop-color","orangered");
    }
}


setInterval(() => {
    slider_animation();
    if(slider_num == 5){
        slider_num = 1;
    }
}, 6000);




// Slider icon's Animation --

var img_one = document.querySelector(".img_one");
var img_two = document.querySelector(".img_two");
var img_three = document.querySelector(".img_three");
var img_four = document.querySelector(".img_four");
var img_five = document.querySelector(".img_five");
var img_six = document.querySelector(".img_six");
var img_seven = document.querySelector(".img_seven");
var img_eight = document.querySelector(".img_eight");
var img_nine = document.querySelector(".img_nine");
var img_ten = document.querySelector(".img_ten");
var img_eleven = document.querySelector(".img_eleven");
var img_twelve = document.querySelector(".img_twelve");


var icon_slide = 1;

function icon_animate(){
    icon_slide++;
    if(icon_slide == 2){
        img_one.style.top = "-700px";
        img_two.style.top = "-700px";
        img_three.style.top = "-700px";
        img_four.style.top = "-700px";
        img_five.style.top = "-700px";
        img_six.style.top = "-700px";
        img_seven.style.top = "-700px";
        img_eight.style.top = "-700px";
        img_nine.style.top = "-700px";
        img_ten.style.top = "-700px";
        img_eleven.style.top = "-700px";
        img_twelve.style.top = "-700px";

       setTimeout(() => {
            img_one.setAttribute("src","resorces/grocery/1.png");
            img_two.setAttribute("src","resorces/grocery/2.png");
            img_three.setAttribute("src","resorces/grocery/4.png");
            img_four.setAttribute("src","resorces/grocery/5.png");
            img_five.setAttribute("src","resorces/grocery/3.png");
            img_six.setAttribute("src","resorces/grocery/6.png");
            img_seven.setAttribute("src","resorces/grocery/7.png");
            img_eight.setAttribute("src","resorces/grocery/8.png");
            img_nine.setAttribute("src","resorces/grocery/9.png");
            img_ten.setAttribute("src","resorces/grocery/10.png");
            img_eleven.setAttribute("src","resorces/grocery/11.png");
            img_twelve.setAttribute("src","resorces/grocery/12.png");
       }, 500);

        setTimeout(() => {
            img_one.style.top = "100px";
            img_two.style.top = "300px";
            img_three.style.top = "500px";
            img_four.style.top = "100px";
            img_five.style.top = "300px";
            img_six.style.top = "100px";
            img_seven.style.top = "130px";
            img_eight.style.top = "290px";
            img_nine.style.top = "480px";
            img_ten.style.top = "420px";
            img_eleven.style.top = "100px";
            img_twelve.style.top = "480px";
        }, 600);
    }
    else if(icon_slide == 3){
        img_one.style.top = "-700px";
        img_two.style.top = "-700px";
        img_three.style.top = "-700px";
        img_four.style.top = "-700px";
        img_five.style.top = "-700px";
        img_six.style.top = "-700px";
        img_seven.style.top = "-700px";
        img_eight.style.top = "-700px";
        img_nine.style.top = "-700px";
        img_ten.style.top = "-700px";
        img_eleven.style.top = "-700px";
        img_twelve.style.top = "-700px";

        setTimeout(() => {
            img_one.setAttribute("src","resorces/veg&Fruits/1.png");
            img_two.setAttribute("src","resorces/veg&Fruits/2.png");
            img_three.setAttribute("src","resorces/veg&Fruits/3.png");
            img_four.setAttribute("src","resorces/veg&Fruits/4.png");
            img_five.setAttribute("src","resorces/veg&Fruits/5.png");
            img_six.setAttribute("src","resorces/veg&Fruits/6.png");
            img_seven.setAttribute("src","resorces/veg&Fruits/7.png");
            img_eight.setAttribute("src","resorces/veg&Fruits/8.png");
            img_nine.setAttribute("src","resorces/veg&Fruits/9.png");
            img_ten.setAttribute("src","resorces/veg&Fruits/10.png");
            img_eleven.setAttribute("src","resorces/veg&Fruits/11.png");
            img_twelve.setAttribute("src","resorces/veg&Fruits/12.png");
        }, 500);

        setTimeout(() => {
            img_one.style.top = "100px";
            img_two.style.top = "300px";
            img_three.style.top = "500px";
            img_four.style.top = "100px";
            img_five.style.top = "300px";
            img_six.style.top = "100px";
            img_seven.style.top = "130px";
            img_eight.style.top = "290px";
            img_nine.style.top = "480px";
            img_ten.style.top = "420px";
            img_eleven.style.top = "100px";
            img_twelve.style.top = "480px";
        }, 600);
    }
    else if(icon_slide == 4){
        img_one.style.top = "-700px";
        img_two.style.top = "-700px";
        img_three.style.top = "-700px";
        img_four.style.top = "-700px";
        img_five.style.top = "-700px";
        img_six.style.top = "-700px";
        img_seven.style.top = "-700px";
        img_eight.style.top = "-700px";
        img_nine.style.top = "-700px";
        img_ten.style.top = "-700px";
        img_eleven.style.top = "-700px";
        img_twelve.style.top = "-700px";

        setTimeout(() => {
            img_one.setAttribute("src","resorces/medicines/11.png");
            img_two.setAttribute("src","resorces/medicines/2.png");
            img_three.setAttribute("src","resorces/medicines/4.png");
            img_four.setAttribute("src","resorces/medicines/3.png");
            img_five.setAttribute("src","resorces/medicines/6.png");
            img_six.setAttribute("src","resorces/medicines/5.png");
            img_seven.setAttribute("src","resorces/medicines/7.png");
            img_eight.setAttribute("src","resorces/medicines/8.png");
            img_nine.setAttribute("src","resorces/medicines/9.png");
            img_ten.setAttribute("src","resorces/medicines/10.png");
            img_eleven.setAttribute("src","resorces/medicines/1.png");
            img_twelve.setAttribute("src","resorces/medicines/12.png");
        }, 500);
    
        setTimeout(() => {
            img_one.style.top = "100px";
            img_two.style.top = "300px";
            img_three.style.top = "500px";
            img_four.style.top = "100px";
            img_five.style.top = "300px";
            img_six.style.top = "100px";
            img_seven.style.top = "130px";
            img_eight.style.top = "290px";
            img_nine.style.top = "480px";
            img_ten.style.top = "420px";
            img_eleven.style.top = "100px";
            img_twelve.style.top = "480px";
        }, 600);
    }
}


setInterval(() => {
    icon_animate();
    if(icon_slide == 5){
        icon_slide = 1;
    }
}, 6000);




// Toggle NavBar & More ----
var navbox = document.querySelector(".navbox");
var searchBox = document.querySelector("#search_box");
var mousedownIcon = document.querySelector(".mousedown");

var li_home = document.querySelector(".home_indicate");
var li_category = document.querySelector(".category_indicate");
var li_service = document.querySelector(".service_indicate");

window.addEventListener('scroll',function(){
    li_home.classList.toggle("indicator",window.scrollY < 500);
    li_category.classList.toggle("indicator",(window.scrollY > 500) && (window.scrollY < 1300))
    li_service.classList.toggle("indicator",window.scrollY > 1300);

    mousedownIcon.classList.toggle("mousedown_hide",window.scrollY > 520);
    searchBox.classList.toggle("searchBox_hide",window.scrollY > 575);
});




// result filteration -- 

var search_box_result = document.querySelector(".search_result");
var counter = document.querySelector(".counter");
var total_no_res = document.querySelectorAll(".total_num");
var i;

function get_Res(){
    for (i = 0; i < total_no_res.length; i++) {
        if(total_no_res.length == 1){
            counter.innerText = total_no_res.length + ' Shop';
        }
        else{
            counter.innerText = total_no_res.length + " Shop's";
        }
    }
}

setInterval(() => {
    get_Res();
}, 80);



// Search Box -- 


search_box_result.onclick = () =>{
    window.scroll({
        top: 570,
        left: 0,
        behavior: 'smooth'
      });
}

search_box_result.onkeyup = (event) => {
    if(search_box_result.value.length != "" && event.keyCode == 13){
        window.scroll({
            top: 740,
            left: 0,
            behavior: 'smooth'
        });
        search_box_result.value = "";
    }
}


// Sub Navbar --
var relevent_filter = document.querySelector(".relevent_select");
var time_filter = document.querySelector(".time_select");
var rating_filter = document.querySelector(".rating_select");
var near_filter = document.querySelector(".near_select");


relevent_filter.onclick = () =>{
    relevent_filter.setAttribute("class","relevent");
    time_filter.removeAttribute("class","timing");
    rating_filter.removeAttribute("class","rate");
    near_filter.removeAttribute("class","near");
}


time_filter.onclick = () =>{
    time_filter.setAttribute("class","timing");
    relevent_filter.removeAttribute("class","relevent");
    rating_filter.removeAttribute("class","rate");
    near_filter.removeAttribute("class","near");
}

rating_filter.onclick = () =>{
    rating_filter.setAttribute("class","rate");
    relevent_filter.removeAttribute("class","relevent");
    time_filter.removeAttribute("class","timing");
    near_filter.removeAttribute("class","near");
}


near_filter.onclick = () =>{
    near_filter.setAttribute("class","near");
    rating_filter.removeAttribute("class","rate");
    relevent_filter.removeAttribute("class","relevent");
    time_filter.removeAttribute("class","timing");
}





// Card Validation ---
var shop_status = document.querySelector(".shop_status");
var redirect_to_detail = document.querySelector(".redirection");
var delivery_time = document.querySelector(".place_time");
var shop_container = document.querySelector(".detail_container");
var time_icon = document.querySelector(".time_icon");


setInterval(() => {
    if(shop_status.innerText == "Shop Closed"){
        shop_status.style.backgroundColor = "#555";
        delivery_time.style.opacity = "0";
        shop_container.style.filter = "grayscale(100%)";
        time_icon.style.opacity = "0";
    }
    else if(shop_status.innerText == "Shop Open"){
        delivery_time.style.opacity = "1";
        shop_container.style.filter = "grayscale(0%)";
        shop_status.style.backgroundColor = "green";
        time_icon.style.opacity = "1";
    }
}, 80);


redirect_to_detail.onclick = (event) =>{
    if(shop_status.innerText == "Shop Closed"){
        event.preventDefault();
    }
    else{
        event.stopPropagation();
    }
}


// li:4 user get width to change width of sub-div Animation Transiton--

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


// Sub location box --

var geoLocation_field = document.querySelector(".geoLocation_field");
var getLocation_box = document.querySelector(".getLocation_box");

geoLocation_field.onclick = () =>{
    if(m_icon_6.value.length > 1){
        getLocation_box.style.display = "none";
        getLocation_box.style.marginTop = "-5px";
        getLocation_box.style.opacity = "0";
    }
    else{
        setTimeout(() => {
            getLocation_box.style.display = "block";
            getLocation_box.style.display = "flex";
        }, 10);
        setTimeout(() => {
            getLocation_box.style.marginTop = "0px";
            getLocation_box.style.opacity = "1";
        }, 150);
    }
}

geoLocation_field.onmouseleave = () =>{
    getLocation_box.style.display = "none";
    getLocation_box.style.marginTop = "-5px";
    getLocation_box.style.opacity = "0";
}

m_icon_6.onkeydown = () =>{
    getLocation_box.style.display = "none";
    getLocation_box.style.marginTop = "-5px";
    getLocation_box.style.opacity = "0";
}












