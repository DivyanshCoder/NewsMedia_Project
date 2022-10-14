// var btn1 = document.querySelector('#green');
// var btn2 = document.querySelector('#red');
// console.log(btn1, btn2);
// btn1.addEventListener('click', function() {
  
//     if (btn2.classList.contains('red')) {
//       btn2.classList.remove('red');
//     } 
//   this.classList.toggle('green');
  
// });

// btn2.addEventListener('click', function() {
  
//     if (btn1.classList.contains('green')) {
//       btn1.classList.remove('green');
//     } 
//   this.classList.toggle('red');
  
// });

// let liked = $('.green').click(function(e) {
//     console.log(e.id);
// })


function liked(number,offset,likes){
    let data = {number : number,offset:offset,likes:likes+1}
    $.post("/liked", data, function (data, status) {
        console.log("Post is done ");
    });
    console.log(number);
    console.log(offset);
    console.log(likes);
}

// let data = 7897979;

