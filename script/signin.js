var verifyicon = document.querySelector("#Verifyicon");
var otpbtn = document.querySelector("#otpVerify");
var closetopPage = document.querySelector("#closeotpPage");
var otpPage = document.querySelector("#center");
var submitIn = document.querySelector("#Usersubmit");
var emailbox = document.querySelector(".email");
var passwordbox = document.querySelector(".password");
var confirmbtnIcon = document.querySelector("#confirmIcon");

var mailIcon = document.querySelector("#mailIcon");
var passwordIcon = document.querySelector("#passwordIcon");
var mainContainer = document.querySelector("#form_container");

emailbox.onclick = () =>{
    mailIcon.setAttribute("trigger","loop");
    setTimeout(() => {
        mailIcon.setAttribute("trigger","");
    }, 500);
}

passwordbox.onclick = () =>{
    passwordIcon.setAttribute("trigger","loop");
    setTimeout(() => {
        passwordIcon.setAttribute("trigger","");
    }, 500);
}

otpbtn.onmouseenter = () =>{
    verifyicon.style.marginLeft = "-4vw";
    otpbtn.style.paddingLeft = "4vw";
    verifyicon.setAttribute("trigger","loop");
    setTimeout(() => {
        verifyicon.setAttribute("trigger","");
    }, 500);
}

otpbtn.onmouseleave = () =>{
    verifyicon.style.marginLeft = "-80vw";
    otpbtn.style.paddingLeft = "2vw";
}

// Submit button --

var counter = 0;

submitIn.onclick = (e) =>{
    var password = /^[A-Za-z]\w{7,15}$/;
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if(emailbox.value.match(mailformat)){
        counter = 1;
    }
    else{ 
        actionpage.style.top = "0vh";

        argument_1.style.display = "block";
        argument_2.style.display = "block";
        argument_1.innerText = "Email is Required.";
        argument_2.innerText = "Please Provide Us,Your Correct Email Address.";
        e.preventDefault();
    }

    if(passwordbox.value.match(password)) {
        counter = 2;
        e.preventDefault();
    }
    else{ 
        actionpage.style.top = "0vh";

        argument_3.style.display = "block";
        argument_4.style.display = "block";
        argument_3.innerText = "Password is Required";
        argument_4.innerText = "Please Enter Your Correct Formate.";
         e.preventDefault();
    }    
}

//--------------

function check_passbox(){
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(emailbox.value.match(mailformat)){
        passwordbox.style.pointerEvents = "fill";
    }
    else if(!emailbox.value.match(mailformat)){
        passwordbox.style.pointerEvents = "none";
    }
}
setInterval(() => {
    check_passbox();
}, 500);

//-----------------


submitIn.onmouseenter = () =>{
    submitIn.style.paddingLeft = "4vw";
    confirmbtnIcon.style.marginTop = "0vh";
    confirmbtnIcon.setAttribute("trigger","loop");
    setTimeout(() => {
        confirmbtnIcon.setAttribute("trigger","");
    }, 500);
}
submitIn.onmouseleave = () =>{
    submitIn.style.paddingLeft = "2vw";
    confirmbtnIcon.style.marginTop = "20vh";
}


// Action Page --

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


var cleartime = setInterval(() => { 
    if(counter == 2){
    otpPage.style.opacity = "1";
    otpPage.style.pointerEvents = "fill";
    mainContainer.style.pointerEvents = "none";
    setTimeout(() => {
        closeotpPage.style.opacity = "1";
        closeotpPage.style.pointerEvents = "fill";
    }, 6500);
    }
}, 600);


// Otp verification -- 


var otpbox = document.querySelector("#otpbox");

window.onkeyup = () =>{
    if(otpbox.value.length > 5){
        otpbtn.style.opacity = "1";
        otpbtn.style.pointerEvents = "fill";
    }
    else if(otpbox.value.length <= 5){
        otpbtn.style.opacity = "0.6";
        otpbtn.style.pointerEvents = "none";
    }
}



// closing Otp Page --

closeotpPage.onclick = () =>{
    otpPage.style.opacity = "0";
    otpPage.style.pointerEvents = "none";
    clearInterval(cleartime,500);
    mainContainer.style.pointerEvents = "fill";
}


