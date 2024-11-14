var btn1 = document.querySelector(".btn_one");
var btn2 = document.querySelector(".btn_two");
var img_slider = document.querySelector("#img_transis");
var heading = document.querySelector(".heading");
var more = document.querySelector(".more");


var slider = 0;

btn2.onclick = () => {
    ++slider;
    if(slider == 0){
        btn1.style.opacity = "0.6";
        btn1.style.pointerEvents = "none";
        img_slider.setAttribute("src","resorces/About/hii.png");

        heading.innerHTML = "Hey Welcome<span>!</span>";
        more.innerText = "hello visitor, thanks for reaching us. we are glad you visit us & also thanks to be with us forever, I hope You will like our service. in future we will try to improve our-self to give you a more better service. because you are very important for us. or we will promise to you that we are always present in your help";
    }
    else if(slider == 1){
        btn1.style.opacity = "1";
        btn1.style.pointerEvents = "fill";
        btn2.style.opacity = "1";
        btn2.style.pointerEvents = "fill";
        img_slider.setAttribute("src","resorces/About/who-we-are.png");

        heading.innerHTML = "Who We Are<span>!</span>";
        more.innerText = "We are from onbuggy. we are new at market and start our first start-up. onbuggy was launched 2021, our team have some professional people's there guidence make our team and group more independable. Our technology platform connects customers, shop partners and delivery partners, serving their essential needs. Customers use our platform to search and discover shop ";
    }
    else if(slider == 2){
        btn2.style.opacity = "0.6";
        btn2.style.pointerEvents = "none";
        img_slider.setAttribute("src","resorces/About/we.png");

        heading.innerHTML = "Our Work<span>!</span>";
        more.innerText = "Our Work is supply or deliver product from shop to your home, at now we will deliver only your essential daily-need stuff's like grocery's, medical and fruits or vegetable to your hand at any time. we will provide you 24/7 customer service to complete your demand and solve your issue, we always try to gain your trust. in anyhow we never want to lose your trust";
    }

    console.log(heading.innerHTML);
}


btn1.onclick = () => {
    --slider;
    if(slider == 0){
        btn1.style.opacity = "0.6";
        btn1.style.pointerEvents = "none";
        img_slider.setAttribute("src","resorces/About/hii.png");

        heading.innerHTML = "Hey Welcome<span>!</span>";
        more.innerText = "hello visitor, thanks for reaching us. we are glad you visit us & also thanks to be with us forever, I hope You will like our service. in future we will try to improve our-self to give you a more better service. because you are very important for us. or we will promise to you that we are always present in your help";
    }
    else if(slider == 1){
        btn1.style.opacity = "1";
        btn1.style.pointerEvents = "fill";
        btn2.style.opacity = "1";
        btn2.style.pointerEvents = "fill";
        img_slider.setAttribute("src","resorces/About/who-we-are.png");

        heading.innerHTML = "Who We Are<span>!</span>";
        more.innerText = "We are from onbuggy. we are new at market and start our first start-up. onbuggy was launched 2021, our team have some professional people's there guidence make our team and group more independable. Our technology platform connects customers, shop partners and delivery partners, serving their essential needs. Customers use our platform to search and discover shop ";
    }
    else if(slider == 2){
        btn2.style.opacity = "0.6";
        btn2.style.pointerEvents = "none";
        img_slider.setAttribute("src","resorces/About/we.png");

        heading.innerHTML = "Our Work<span>!</span>";
        more.innerText = "Our Work is supply or deliver product from shop to your home, at now we will deliver only your essential daily-need stuff's like grocery's, medical and fruits or vegetable to your hand at any time. we will provide you 24/7 customer service to complete your demand and solve your issue, we always try to gain your trust. in anyhow we never want to lose your trust";
    }
}