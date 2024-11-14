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


// li:2 user get width to change width of sub-div Animation Transiton--


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


// Form transition and verification -- 

var label_1 = document.querySelector(".label-1");
var label_2 = document.querySelector(".label-2");
var label_3 = document.querySelector(".label-3");
var label_4 = document.querySelector(".label-4");

var form_input_1 = document.querySelector("#fname");
var form_input_2 = document.querySelector("#lname");
var form_input_3 = document.querySelector("#email");
var form_input_4 = document.querySelector("#p_number");

var name_box = document.querySelector(".name_blocks");
var email_box = document.querySelector(".email_block");
var number_block = document.querySelector(".number_block");


form_input_1.onclick = () =>{
    label_1.style.margin = "-10px 10px";
    label_1.style.color = "#30e849";
    form_input_1.style.border = "2px solid #000";

    if(form_input_2.value.length > 1){
        label_2.style.margin = "-10px 10px";
        label_2.style.color = "#30e849";
        form_input_2.style.border = "2px solid #000";
    }
    else if(form_input_2.value.length == ""){
        label_2.style.margin = "7px 10px";
        label_2.style.color = "#000";
        form_input_2.style.border = "1px solid #000";
    }
}

form_input_2.onclick = () =>{
    label_2.style.margin = "-10px 10px";
    label_2.style.color = "#30e849";
    form_input_2.style.border = "2px solid #000";

    if(form_input_1.value.length > 1){
        label_1.style.margin = "-10px 10px";
        label_1.style.color = "#30e849";
        form_input_1.style.border = "2px solid #000";
    }
    else if(form_input_1.value.length == ""){
        label_1.style.margin = "7px 10px";
        label_1.style.color = "#000";
        form_input_1.style.border = "1px solid #000";
    }
}



name_box.onmouseleave = () =>{
    if(form_input_1.value.length > 1 && form_input_2.value.length > 1){
        label_1.style.margin = "-10px 10px";
        label_2.style.margin = "-10px 10px";

        label_1.style.color = "#30e849";
        label_2.style.color = "#30e849";

        form_input_1.style.border = "2px solid #000";
        form_input_2.style.border = "2px solid #000";
    }
    else if(form_input_1.value.length == ""){
        setTimeout(() => {
            label_1.style.margin = "7px 10px";
            label_1.style.color = "#000";
            form_input_1.style.border = "1px solid #000";
          }, 600);
    }

    if(form_input_2.value.length > 1){
        label_2.style.margin = "-10px 10px";
        label_2.style.color = "#30e849";
        form_input_2.style.border = "2px solid #000";
    }
    else if(form_input_2.value.length == ""){
        setTimeout(() => {
            label_2.style.margin = "7px 10px";
            label_2.style.color = "#000";
            form_input_2.style.border = "1px solid #000";
        }, 600);
    }

}



form_input_3.onclick = () =>{
    label_3.style.margin = "-10px 10px";
    label_3.style.color = "#30e849";
    form_input_3.style.border = "2px solid #000";
}

email_box.onmouseleave = () =>{
    if(form_input_3.value.length > 1){
        label_3.style.margin = "-10px 10px";
        label_3.style.color = "#30e849";
        form_input_3.style.border = "2px solid #000";
    }
    else if(form_input_3.value.length == ""){
        setTimeout(() => {
            label_3.style.margin = "7px 10px";
            label_3.style.color = "#000";
            form_input_3.style.border = "1px solid #000";
        }, 600);
    }
}



form_input_4.onclick = () =>{
    label_4.style.margin = "-10px 10px";
    label_4.style.color = "#30e849";
    form_input_4.style.border = "2px solid #000";
}

number_block.onmouseleave = () =>{
    if(form_input_4.value.length > 1){
        label_4.style.margin = "-10px 10px";
        label_4.style.color = "#30e849";
        form_input_4.style.border = "2px solid #000";
    }
    else if(form_input_4.value.length == ""){
        setTimeout(() => {
            label_4.style.margin = "7px 10px";
            label_4.style.color = "#000";
            form_input_4.style.border = "1px solid #000";
        }, 600);
    }
}



window.onload = () =>{
    //Check LocalStorage--

    localStorage.setItem('mod', 'mod');
    if (localStorage.getItem('mod') != null){
      localStorage.removeItem('mod');
    } else {
      alert ('LocalStorage Not Found!');
    }

    // Verify To Store Data--

    var value_form_inp_1 = form_input_1.value;
    var value_form_inp_2 = form_input_2.value;
    var value_form_inp_3 = form_input_3.value;
    var value_form_inp_4 = form_input_4.value;

    localStorage.setItem("user_FName", value_form_inp_1);
    localStorage.setItem("user_LName", value_form_inp_2);
    localStorage.setItem("user_Email", value_form_inp_3);
    localStorage.setItem("user_PNum", value_form_inp_4);


    // Check Form Field is fill or empty --

    if(form_input_1.value.length > 1){
        label_1.style.margin = "-10px 10px";
        label_1.style.color = "#30e849";
        form_input_1.style.border = "2px solid #000";
    }
    else if(form_input_2.value.length > 1){
        label_2.style.margin = "-10px 10px";
        label_2.style.color = "#30e849";
        form_input_2.style.border = "2px solid #000";
    }
    else if(form_input_3.value.length > 1){
        label_3.style.margin = "-10px 10px";
        label_3.style.color = "#30e849";
        form_input_3.style.border = "2px solid #000";
    }
    else if(form_input_4.value.length > 1){
        label_4.style.margin = "-10px 10px";
        label_4.style.color = "#30e849";
        form_input_4.style.border = "2px solid #000";
    }

}



var sub_Btn = document.querySelector("#update_detail");

sub_Btn.onclick = (e) =>{
    if(localStorage.getItem("user_FName") == form_input_1.value && localStorage.getItem("user_LName") == form_input_2.value && localStorage.getItem("user_Email") == form_input_3.value && localStorage.getItem("user_Email") == form_input_4.value){
        form_input_1.style.border = "2px solid red";
        label_1.style.color = "red";
        setTimeout(() => {
            form_input_1.style.border = "1px solid #000";
            label_1.style.color = "#30e849";
        }, 8000);


        form_input_2.style.border = "2px solid red";
        label_2.style.color = "red";
        setTimeout(() => {
            form_input_2.style.border = "1px solid #000";
            label_2.style.color = "#30e849";
        }, 8000);


        form_input_3.style.border = "2px solid red";
        label_3.style.color = "red";
        setTimeout(() => {
            form_input_3.style.border = "1px solid #000";
            label_3.style.color = "#30e849";
        }, 8000);
    

        form_input_4.style.border = "2px solid red";
        label_4.style.color = "red";
        setTimeout(() => {
            form_input_4.style.border = "1px solid #000";
            label_4.style.color = "#30e849";
        }, 8000);
            e.preventDefault();
    }
    else if(form_input_1.value.length == "" || form_input_2.value.length == "" || form_input_3.value.length == "" || form_input_4.value.length == ""){
        form_input_1.style.border = "2px solid red";
        label_1.style.color = "red";
        setTimeout(() => {
            form_input_1.style.border = "1px solid #000";
            label_1.style.color = "#30e849";
        }, 8000);


        form_input_2.style.border = "2px solid red";
        label_2.style.color = "red";
        setTimeout(() => {
            form_input_2.style.border = "1px solid #000";
            label_2.style.color = "#30e849";
        }, 8000);


        form_input_3.style.border = "2px solid red";
        label_3.style.color = "red";
        setTimeout(() => {
            form_input_3.style.border = "1px solid #000";
            label_3.style.color = "#30e849";
        }, 8000);
    

        form_input_4.style.border = "2px solid red";
        label_4.style.color = "red";
        setTimeout(() => {
            form_input_4.style.border = "1px solid #000";
            label_4.style.color = "#30e849";
        }, 8000);
            e.preventDefault();
    }
    else if(localStorage.getItem("user_FName") == form_input_1.value){
        form_input_1.style.border = "2px solid red";
        label_1.style.color = "red";

        setTimeout(() => {
            form_input_1.style.border = "1px solid #000";
            label_1.style.color = "#30e849";
        }, 8000);
        e.preventDefault();
    }
    else if(localStorage.getItem("user_LName") == form_input_2.value){
        form_input_2.style.border = "2px solid red";
        label_2.style.color = "red";

        setTimeout(() => {
            form_input_2.style.border = "1px solid #000";
            label_2.style.color = "#30e849";
        }, 8000);
        e.preventDefault();
    }
    else if(localStorage.getItem("user_Email") == form_input_3.value){
        form_input_3.style.border = "2px solid red";
        label_3.style.color = "red";

        setTimeout(() => {
            form_input_3.style.border = "1px solid #000";
            label_3.style.color = "#30e849";
        }, 8000);
        e.preventDefault();
    }
    else if(localStorage.getItem("user_Email") == form_input_4.value){
        form_input_4.style.border = "2px solid red";
        label_4.style.color = "red";

        setTimeout(() => {
            form_input_4.style.border = "1px solid #000";
            label_4.style.color = "#30e849";
        }, 8000);
        e.preventDefault();
    }
    else{
        e.stopPropagation();
        localStorage.removeItem("user_FName");
        localStorage.removeItem("user_LName");
        localStorage.removeItem("user_Email");
        localStorage.removeItem("user_PNum");
    }
}


// Some Effect --

var box_1 = document.querySelector(".box-1");
var box_2 = document.querySelector(".box-2");
var main_form_box = document.querySelector("#main_form_box");


main_form_box.onmouseenter = () =>{
    box_1.style.filter = "blur(3px)";
    box_2.style.filter = "blur(3px)";
}


main_form_box.onmouseleave = () =>{
    box_1.style.filter = "blur(0px)";
    box_2.style.filter = "blur(0px)";
}


















