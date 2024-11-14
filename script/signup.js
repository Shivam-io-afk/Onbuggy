var textbox = document.querySelector(".name");
var passwordbox = document.querySelector(".password");
var emailbox = document.querySelector(".email");
var submitBtn = document.querySelector("#Usersubmit");
var nameIcon = document.querySelector("#nameIcon");
var passIcon = document.querySelector("#passwordIcon");
var mailIcon = document.querySelector("#mailIcon");
var confirmbtnIcon = document.querySelector("#confirmIcon");



// Animation on ICON ----------

textbox.onclick = () =>{
    nameIcon.setAttribute("trigger","loop");
    setTimeout(() => {
        nameIcon.setAttribute("trigger","");
    }, 1000);
}

// --------
passwordbox.onclick = () =>{
    passIcon.setAttribute("trigger","loop");
    setTimeout(() => {
        passIcon.setAttribute("trigger","");
    }, 1000);
}

// ------
emailbox.onclick = () =>{
    mailIcon.setAttribute("trigger","loop");
    setTimeout(() => {
        mailIcon.setAttribute("trigger","");
    }, 1000);
}

submitBtn.onmouseenter = () =>{
    submitBtn.style.paddingLeft = "3.5vw";
    confirmbtnIcon.style.marginTop = "0vh";
    confirmbtnIcon.setAttribute("trigger","loop");
    setTimeout(() => {
        confirmbtnIcon.setAttribute("trigger","");
    }, 500);
}
submitBtn.onmouseleave = () =>{
    submitBtn.style.paddingLeft = "0vw";
    confirmbtnIcon.style.marginTop = "20vh";
}

// ---------------------------------------

// Form Validation ---------

var actionpage = document.querySelector("#actionPage");
var argument_1 = document.querySelector(".line_1");
var argument_2 = document.querySelector(".line_2");
var argument_3 = document.querySelector(".line_3");
var argument_4 = document.querySelector(".line_4");

var close_page = document.querySelector(".close_action_page");



close_page.onclick = () =>{
    actionpage.style.top = "-40vh"
    setTimeout(() => {
        clear_outputs();
    }, 600);
}


submitBtn.onclick = (e) => {    
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    var password = /^[A-Za-z]\w{7,15}$/;


    if(textbox.value.length <= 0 && passwordbox.value.length <= 0 && emailbox.value.length <= 0){
        e.preventDefault();
        show_outputs();
        actionpage.style.top = "0vh";
    }
    else if(textbox.value.length <= 3){
        e.preventDefault();
        show_outputs();
        actionpage.style.top = "0vh";
    }
    else if(!passwordbox.value.match(password)) {
        actionpage.style.top = "0vh";
        e.preventDefault();

        argument_1.style.display = "block";
        argument_2.style.display = "block";
        argument_3.style.display = "block";
        argument_1.innerText = "Password is Required";
        argument_2.innerText = "Please Enter Your Correct Password.";
        argument_3.innerText = "Password Start With Alphabets and end with numeric."
    }  
    else if(!emailbox.value.match(mailformat)){
        e.preventDefault();
        actionpage.style.top = "0vh";

        argument_1.style.display = "block";
        argument_2.style.display = "block";

        argument_1.innerText = "Email is Required.";
        argument_2.innerText = "Please Enter Your Valid Your Email Address.";

    }
    
}


var clear_outputs = function(){
    argument_1.style.display = "none";
    argument_2.style.display = "none";
    argument_3.style.display = "none";
    argument_4.style.display = "none";

    argument_1.innerText = "";
    argument_2.innerText = "";
    argument_3.innerText = "";
    argument_4.innerText = "";
}
var show_outputs = function(){
    if(textbox.value.length <= 0 && passwordbox.value.length <= 0 && emailbox.value.length <= 0){
        argument_1.style.display = "block";
        argument_2.style.display = "block";
        argument_3.style.display = "block";

        argument_1.innerText = "All fields are Required.";
        argument_2.innerText = "Create Password Which is greater then 4 digits.";
        argument_3.innerText = "Please Provide Us,Your Correct Email Address.";
    }
    else if(textbox.value.length <= 3){
        argument_1.style.display = "block";
        argument_2.style.display = "block";
        argument_3.style.display = "block";
        
        argument_1.innerText = "Name is Required.";
        argument_2.innerText = "Please Enter Your Full Name.";
        argument_3.innerText = "Please Provide Us, Your Valid UserName.";
    }
    else if(passwordbox.value.length <= 4){
        argument_1.style.display = "block";
        argument_2.style.display = "block";

        argument_1.innerText = "Password is Required";
        argument_2.innerText = "Please Make Sure Your Password is greater then 4 digits.";
    }
}
