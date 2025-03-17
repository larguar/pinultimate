window.onload = function() {

  // Product Page Image Thumbnails
  // document.querySelectorAll(".lg-thumbnails button").forEach(function(btn) {
  //   document.getElementById(btn.id).addEventListener("click", function() {
  //     let id = this.id;
  //     document.querySelectorAll(".lg-image-container").forEach(function(img) {
  //       if (img.classList.contains("lg-active")) {
  //         img.classList.remove("lg-active");
  //       }
  //       if (img.classList.contains(id)) {
  //         img.classList.add("lg-active");
  //       }
  //     });
  //   });
  // });

  // let read_more = document.getElementById('read-more')
  // let read_less = document.getElementById('read-less');
  // let truncated_description = document.getElementById('truncated-product-description');
  // let full_description = document.getElementById('product-description');

  // read_more.addEventListener('click', showHideDescription)
  // read_less.addEventListener('click', showHideDescription)

  // function showHideDescription(){
  //   let ID = this.id
  //   if(ID === "read-more"){
  //     truncated_description.style.display = "none";
  //     full_description.style.display = "block";
  //   }else {
  //     truncated_description.style.display = "block";
  //     full_description.style.display = "none";    
  //   }
  // }

  // Maker Count
  document.querySelectorAll(".maker-count").forEach(function(span) {
    let makers = document.getElementById("makers");
    let makerCount = makers.textContent.trim();
    span.innerHTML = makerCount;
  });

  // Years in Business Count
  document.querySelectorAll(".yib-count").forEach(function(span) {
    let yib = document.getElementById("yib");
    let yibCount = yib.textContent.trim();
    span.innerHTML = yibCount;
  });

  // Reviews toggle circle animation
  setTimeout(() => {
    let sswButtonIndex = 0;
    document.querySelectorAll("#ssw-review-switcher-buttons-wrapper a").forEach(function(a) {
      if (sswButtonIndex == 0) {
        a.id = "lg-product-reviews";
        a.classList.add("lg-active");
      } else if (sswButtonIndex == 1) {
        a.id = "lg-site-reviews";
      }
      sswButtonIndex++;
      let span = document.createElement("span");
      a.append(span);
    });
    document.getElementById("lg-product-reviews").addEventListener("click", function() {
      console.log("clicked product reviews button");
      document.getElementById("lg-site-reviews").classList.remove("lg-active");
      this.classList.add("lg-active");
    });
    document.getElementById("lg-site-reviews").addEventListener("click", function() {
      console.log("clicked site reviews button");
      document.getElementById("lg-product-reviews").classList.remove("lg-active");
      this.classList.add("lg-active");
    });
  }, 2000);

  // Reviews Count
  document.querySelectorAll(".review-count").forEach(function(span) {
    let reviewWidget = document.getElementById("_352");
    if (reviewWidget != null) {
      let reviewCount = reviewWidget.textContent.trim();
      span.innerHTML = reviewCount;
    } else {
      setTimeout(() => {
        reviewWidget = document.getElementById("_352");
        if (reviewWidget != null) {
          let reviewCount = reviewWidget.textContent.trim();
          span.innerHTML = reviewCount;
          // document.querySelectorAll("#ssw-review-switcher-buttons-wrapper a").forEach(function(a) {
          //   a.append("test");
          // });
        } else {
          setTimeout(() => {
            reviewWidget = document.getElementById("_352");
            if (reviewWidget != null) {
              let reviewCount = reviewWidget.textContent.trim();
              span.innerHTML = reviewCount;
              // document.querySelectorAll("#ssw-review-switcher-buttons-wrapper a").forEach(function(a) {
              //   a.append("test");
              // });
            } else {
              setTimeout(() => {
                reviewWidget = document.getElementById("_352");
                if (reviewWidget != null) {
                  let reviewCount = reviewWidget.textContent.trim();
                  span.innerHTML = reviewCount;
                  // document.querySelectorAll("#ssw-review-switcher-buttons-wrapper a").forEach(function(a) {
                  //   a.append("test");
                  // });
                }
              }, 5000);
            }
          }, 2000);
        }
      }, 1000);
    }
  });

  // Add arrow svg to display links
  let svg = '<svg viewBox="0 0 20 7.25" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M19.9808714,3.74648261 C19.9824026,3.74157005 19.9838161,3.7366575 19.985151,3.73170564 C19.9871926,3.72427785 19.9889987,3.71681077 19.9906084,3.70934368 C19.9914722,3.70533504 19.9924145,3.70136569 19.9931605,3.69731774 C19.9953592,3.68552761 19.997126,3.67369817 19.9982646,3.66186874 C19.9982646,3.66186874 19.9982646,3.66182944 19.9982646,3.66182944 C19.9994424,3.6498035 20,3.63777756 20,3.62575162 C20,3.62260758 20,3.61946355 20,3.61631951 C19.9997565,3.60728041 19.9993246,3.59831991 19.9985787,3.5893594 C19.9983038,3.58566516 19.998029,3.58197092 19.9976364,3.57827668 C19.9966548,3.56911967 19.9953199,3.56000197 19.9937101,3.55092356 C19.9926108,3.54471409 19.9913151,3.53858322 19.989941,3.53245235 C19.9883705,3.52545687 19.9868,3.51850069 19.9848761,3.51158381 C19.982913,3.50447043 19.9805573,3.49743565 19.9782016,3.49040086 C19.9771807,3.48737473 19.9761599,3.48430929 19.9750213,3.48132246 C19.9550761,3.42614463 19.9235092,3.37426803 19.8793392,3.33009432 C19.8750596,3.32581057 19.8704267,3.32207703 19.8659901,3.31798978 L16.6720063,0.120937316 C16.5109133,-0.0403124386 16.2493482,-0.0403124386 16.0882552,0.120937316 C15.9272015,0.28214777 15.9272015,0.544006681 16.0882552,0.705217135 L18.5907523,3.21014934 L0.412371376,3.21014934 C0.184257723,3.21014934 0,3.39458636 0,3.62288269 C0,3.85117901 0.184257723,4.03565534 0.412371376,4.03565534 L18.5907523,4.03565534 L16.0844075,6.54443899 C15.9233145,6.70564944 15.9233145,6.96750835 16.0844075,7.12871881 C16.1643062,7.20999214 16.2699609,7.25 16.3756156,7.25 L16.3756156,7.25 C16.4813096,7.25 16.5869643,7.20999214 16.6681193,7.12871881 L19.8793392,3.91441344 C19.881106,3.91260562 19.882598,3.9106799 19.8843648,3.90887208 C19.8864064,3.90674985 19.8882517,3.90447043 19.8902541,3.9023089 C19.9001482,3.89161918 19.9093356,3.88057575 19.9178555,3.86913932 C19.9205253,3.86560228 19.9231951,3.86206524 19.9257472,3.858371 C19.929909,3.85247593 19.9338352,3.84646296 19.9376437,3.84037139 C19.9401957,3.83628414 19.94263,3.83207899 19.945025,3.82783455 C19.9484408,3.82193948 19.9519351,3.81608371 19.9549976,3.81003144 C19.9597483,3.80075653 19.9641849,3.79124582 19.9682682,3.78153861 C19.9683467,3.78130281 19.9684253,3.78106701 19.9685038,3.7808312 C19.9705062,3.77603655 19.9721552,3.77116329 19.9739612,3.76629004 C19.9763955,3.75972686 19.9787905,3.75312439 19.9808714,3.74648261" fill="#000000"></path></svg>';
  document.querySelectorAll("a.display").forEach(function(a) {
    a.innerHTML = a.innerHTML += svg;
  });
  
  // Add 'disabled' class to disabled <a> buttons
  document.querySelectorAll("a.button").forEach(function(button) {
    if (button.hasAttribute("aria-disabled")) {
      button.classList.add("disabled");
      console.log(button.classList);
    }
  });

  // Parallax Elements
  (function() {
  
    var start = null;
    var scrollPosition = window.scrollY;
    var halfWindowHeight = window.innerHeight / 2;
    var rAFstarted = false;
    
    var scrollnimates = [].slice.call(document.getElementsByClassName('scrollnimate'));
    // get their offset from top of screen and their scroll speed
    scrollnimates.forEach( function ( sn ) {
        var clientOffsets = sn.getBoundingClientRect();
        sn.animationOffset = clientOffsets.top + scrollPosition;
        sn.magicNumber = sn.dataset.magicNumber || sn.getAttribute("data-magic-number") || "-14";
    } );
    
    /*
       * The rAF function
      */
      function step(timestamp) {
  
        if (!start) start = timestamp;
        // full progress indicator
        var progress = timestamp - start;
        var scrollPoint = window.scrollY;
  
        scrollnimates.forEach( function ( sn ) {
          //sn.animationOffsets == main.he
          if ( scrollPoint > ( sn.animationOffset - halfWindowHeight * 2 ) && scrollPoint < ( sn.animationOffset + halfWindowHeight ) ) {
            var magicPoint = ( scrollPoint - ( sn.animationOffset - halfWindowHeight ) ) / sn.magicNumber;
            var up = magicPoint  + 'px';
  
            sn.style.webkitTransform = 'translateY('+up+')';
            sn.style.MozTransform = 'translateY('+up+')';
            sn.style.msTransform = 'translateY('+up+')';
            sn.style.OTransform = 'translateY('+up+')';
            sn.style.transform = 'translateY('+up+')';
          }
  
        } );
  
        window.requestAnimationFrame(step);
  
      }
  
     
      window.requestAnimationFrame(step);
      
  })();

  // Policy Pages Formatting
  if (window.location.pathname.slice(0,9) == "/policies") {
    let policyType = window.location.pathname.slice(10);
    document.querySelector(".shopify-policy__container").classList.add(policyType);
    document.querySelector(".shopify-policy__title").classList.add("lg-page-banner", "bg-dark");
    document.querySelector(".shopify-policy__body").classList.add("lg-row");
    document.querySelector(".shopify-policy__body .rte").classList.add("lg-page-content", "lg-col");

    let contact = "Contact Us";
    let contactImage = "https://cdn.shopify.com/s/files/1/0106/9426/2842/files/317775361_533204498456320_4531707310695921206_n.jpg?v=1733445481";
    let contactLink = "/pages/contact";
    let terms = "Terms of Service";
    let termsImage = "https://cdn.shopify.com/s/files/1/0106/9426/2842/files/365890790_1035446947825013_9064487414833482552_n.jpg?v=1711566753";
    let termsLink = "/policies/terms-of-service";
    let privacy = "Privacy Policy";
    let privacyImage = "https://cdn.shopify.com/s/files/1/0106/9426/2842/files/DSC04296_800x_e46e218a-b701-4388-bb2e-474f9ca3f367.webp?v=1733331315";
    let privacyLink = "/policies/privacy-policy";

    let policyTitle = "";
    let policyDescription = "";
    let highlight = "";
    let highlightImage = "";
    let highlightLink = "";

    if (policyType == "privacy-policy") {
      policyTitle = privacy;
      policyDescription = 'This Privacy Policy describes how your personal information is collected, used, and shared when you visit and/or make a purchase from <a href="/">pinultimate.co</a>.';
      highlight = terms;
      highlightImage = termsImage;
      highlightLink = termsLink;
    } else if (policyType == "terms-of-service") {
      policyTitle = terms;
      policyDescription = 'These Terms of Service outline the rules and regulations for using <a href="/">pinultimate.co</a>, including user responsibilities, prohibited activities, and limitations of liability.';
      highlight = privacy;
      highlightImage = privacyImage;
      highlightLink = privacyLink;
    } else if (policyType == "refund-policy") {
      policyTitle = "Refund Policy";
      policyDescription = 'This Refund Policy outlines the process for returning items, filing a claim for delivery-related issues, and receiving a refund.';
      highlight = terms;
      highlightImage = termsImage;
      highlightLink = termsLink;
    }
    document.querySelector(".shopify-policy__title").innerHTML = `<div class="lg-row lg-grid-4">
      <div class="lg-col lg-banner-details lg-grow">
        <h1>${policyTitle}</h1>
        <p>${policyDescription}</p>
      </div>
      <div class="lg-col lg-highlight-1">
        <a href="${contactLink}" class="lg-card lg-collection-card">
          <div class="lg-card-image">
            <div class="lg-image-container">
              <img src="${contactImage}" alt="${contact}">
            </div>
          </div>
          <div class="lg-card-details">
            <h4>${contact}</h4>
          </div>
        </a>
      </div>
      <div class="lg-col lg-highlight-2">
        <a href="${highlightLink}" class="lg-card lg-collection-card">
          <div class="lg-card-image">
            <div class="lg-image-container">
              <img src="${highlightImage}" alt="${highlight}">
            </div>
          </div>
          <div class="lg-card-details">
            <h4>${highlight}</h4>
          </div>
        </a>
      </div>
    </div>`;
  }

}