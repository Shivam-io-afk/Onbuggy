var m_icon_1 = document.querySelector("#icon_1");
var icon_1 = document.querySelector(".icon_1");
var m_icon_3 = document.querySelector("#icon_3");
var icon_3 = document.querySelector(".icon_3");


m_icon_1.onmouseenter = () =>{
    icon_1.setAttribute("trigger","loop");
    m_icon_1.style.cursor = "pointer";
    setTimeout(() => {
        icon_1.setAttribute("trigger","");
    }, 1000);
}


m_icon_3.onmouseenter = () =>{
    icon_3.setAttribute("trigger","loop");
    m_icon_3.style.cursor = "pointer";
    setTimeout(() => {
        icon_3.setAttribute("trigger","");
    }, 500);
}


// Selection Box--

var selectionBox = document.querySelector("#selection-box");
var option_1 = document.querySelector(".selection-option-1");
var option_6 = document.querySelector(".selection-option-6");

var form_side_B = document.querySelector(".form_side_B");
var fourth_container = document.querySelector(".fourth-container");

var description_box = document.querySelector(".description_box");

form_side_B.onmouseenter = () =>{
    option_1.style.display = "none";
}

selectionBox.onchange = () =>{
    description_box.placeholder = "Tell Us More About It.";
    if(option_6.selected){  
        fourth_container.style.pointerEvents = "none";
        description_box.placeholder = "None";
        description_box.removeAttribute("required");
    }
    else{
        fourth_container.style.pointerEvents = "fill";
        description_box.placeholder = "Tell Us More About It.";
        description_box.setAttribute("required");
    }
}







