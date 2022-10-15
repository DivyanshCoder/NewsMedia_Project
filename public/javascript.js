

var flag = true;
let likedCount = document.getElementById("liked")
let disLikedCount = document.getElementById("disliked")


function liked(number,offset,liked){
    let temp = parseInt(liked) +1;
    let data = {number : number,offset:offset,likes: temp}
    if(flag){
        $.post("/liked", data, function (data, status) {
            console.log("Post is done ");
       });  
       flag = false;
       likedCount.innerHTML = parseInt(likedCount.innerHTML) + 1;
    }
}


function disliked(number,offset,liked){
    let temp = parseInt(liked) +1;
    let data = {number : number,offset:offset,likes: temp}
    if(flag){
        $.post("/disliked", data, function (data, status) {
            console.log("Post is done ");
        });  
        flag = false;
        disLikedCount.innerHTML = parseInt(disLikedCount.innerHTML) + 1;
    }
    
}

let value = document.getElementById("value"); 
let postNumber = value.getAttribute("number");
let newsOffset = value.getAttribute("newsOffset");
console.log(postNumber, newsOffset);
// comment box js


var main = function() {
    $('.btn').click(function() {
        var post = $('.status-box').val();
        $('<li>').text(post).prependTo('.posts');
        $('.status-box').val('');
        $('.counter').text('250');
        $('.btn').addClass('disabled');

        let comment = post;
        let data ={number: postNumber,
                    newsOffset:newsOffset,
                    comment: comment,}

      $.post("/comment",data,function (data, status) {
        console.log("Comment Post is done ");
        });

    });
    $('.status-box').keyup(function() {
      var postLength = $(this).val().length;
      var charactersLeft = 250 - postLength;
      $('.counter').text(charactersLeft);
      if (charactersLeft < 0) {
        $('.btn').addClass('disabled');
      } else if (charactersLeft === 250) {
        $('.btn').addClass('disabled');
      } else {
        $('.btn').removeClass('disabled');
      }
    });
  }
  $('.btn').addClass('disabled');
  $(document).ready(main)