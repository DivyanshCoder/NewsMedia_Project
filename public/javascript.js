

var flag = true;

function liked(number,offset,liked){
    let temp = parseInt(liked) +1;
    let data = {number : number,offset:offset,likes: temp}
    if(flag){
        $.post("/liked", data, function (data, status) {
            console.log("Post is done ");
       });  
       flag = false;
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
    }
    console.log(number,offset,liked)
}

