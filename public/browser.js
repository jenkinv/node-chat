var socket = io.connect('/');
//var socket = io.connect('http://192.168.147.52');
var name ,newcount = 0;
socket.on('history', function(history) {
    if(!!history && history.length) {
        clear();
        for(var i = 0; i < history.length; i++) {
            append(history[i]);
        }
    }
});

socket.on('msg', function(data) {
    if(data.name != name) {
        newcount++;
        document.title = newcount + ' new Message received.';
    }
    
    append(data);
});

socket.on('join', function(data) {
    refreshOnline(data.onlines);
	append(data.item);
});

socket.on('leave', function(data) {
    refreshOnline(data.onlines);
    append(data.item);    
});

function joinCb(data) {
    console.log('joinCb :'+data);
    if(!!data) {
        name = data;
        var form1 = $('form1'),
            form2 = $('form2');
        form1.style.display = 'none';
        form2.style.display = '';
    }
}


//DOM operator
function $(id) {
    return document.getElementById(id);
} 

function clear() {
    var content = document.getElementById('data');
    content.innerHTML = '';
}

function dateString(time) {
    var date = new Date(time);
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + number(date.getDate()) + ' ' + number(date.getHours()) + ':' + number(date.getMinutes()) + ':' + number(date.getSeconds());
}

function number(num){
    return num < 10 ? '0'+num : num;
}

function append(data) {
    if(!data) return;
    var str;
    switch(data.type) {
        case 'msg': str = data.name + ':' + (data.msg||'') ;break;
        case 'join': str = data.name + ' joined.';break;
        case 'leave': str = data.name + ' leaved.';break;
    }
    str += '<span class="date"> - ' + dateString(data.time)+ '</span>';
    var content = document.getElementById('data');
    var p = document.createElement('div');
    if(data.name == name) p.style.color = 'red';
    if(data.type == 'join' || data.type == 'leave') p.style.color = 'grey';
    p.innerHTML = str;
    content.appendChild(p);
    content.scrollTop = '100000';
    console.log(str);
}

function refreshOnline(onlines) {
    var elem = $('users');
    elem.innerHTML = '';
    for(var i = 0, l = onlines.length; i < l; i++) {   
        var p = document.createElement('p');
        if(onlines[i] == name) {
            p.style.color = 'red';
        }
        p.innerText = p.textContent = onlines[i] == name ? onlines[i] + '(YOU)' : onlines[i];
        elem.appendChild(p);
    }
}

//submit join form
function join(){
    var name = $('username').value;
    if(!!name) {
        socket.emit('join', name, joinCb);
    }
    return false;
}

//submit send message form
function formInput(){
    var input = $('text');
    if(!!input.value) {
        socket.emit('msg', input.value);
        input.value = '';
        input.focus();
    }
    return false;
}

window.onload = function() {

    window.onkeydown = function(mozev) {
      var ev = window.event || mozev ;
      if(!!ev && ev.ctrlKey && ev.keyCode == 13) {
        formInput();
      }
    };

    document.onclick = function(){
        newcount = 0;
        document.title = 'No new message!';
    };

}
