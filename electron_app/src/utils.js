
function compute_n_cols() {
    let w = window.innerWidth;
    let n_col;
    if (w < 576) { n_col = 2 } else if (w < 668) { n_col = 3 } else if (w < 892) { n_col = 4 } else if (w < 1100) { n_col = 5 } else if (w < 1600) { n_col = 6 } else if (w < 1900) { n_col = 7 } else if (w < 2100) { n_col = 8 } else if (w < 2400) { n_col = 9 }

    n_col -= 1;
    return n_col;
}



function simple_hash( strr ) {
    var hash = 0;
    for (var i = 0; i < strr.length; i++) {
        var char = strr.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}


function resolve_asset_illustration(name) {
    let pre_assets_list_svg = [
      ];
    let pre_assets_list_png = [
        ];
    if (pre_assets_list_svg.includes(name))
        return require("@/assets/" + name + ".svg")
    else  if (pre_assets_list_png.includes(name))
        return require("@/assets/" + name + ".png")
    else if (name.startsWith("https://") || name.startsWith("http://"))
        return name;
    else
        return "file://" + name;
}




const escapeHtml = (unsafe) => {
    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}


function open_popup( img_url , text ){
            
    let css = `
        <style>
        img {
    
                     width: 100%;
                      height:100%;
                      object-fit: contain;
                      user-drag: none;
          
            }
            @media (prefers-color-scheme: light) {
                body {
                    background-color: #f2f2f2;
                }
            }
            @media (prefers-color-scheme: dark) {
                body {
                    background-color: #303030;
                }
            }
            body{
                padding : 0;
                margin: 0;
                -webkit-user-select: none;
                    -webkit-app-region: drag;
                  
                      user-drag: none;
                        -webkit-user-drag: none;
                        user-select: none;
                        -moz-user-select: none;
                        -webkit-user-select: none;
                        -ms-user-select: none;
            }
            p{
                padding:40px;
            }

       </style>
    `
    let html = '<html><head>'+css+'</head><body>' ;

    if (img_url)
        html += '<img src="'+escapeHtml(img_url)+'"> ';
    
    if( text )
         html += '<p> '+ escapeHtml(text) +' </p>';
    
    html += '</body></html>'
    
    let uri = "data:text/html," + encodeURIComponent(html);
    uri;
    let if_frame= '';
    if(navigator.platform.toUpperCase().indexOf('MAC')>=0 ){
        if_frame = ",frame=false"
    }

    window.open(escapeHtml(uri), '_blank', 'top=100,left=100,nodeIntegration=no'+if_frame); // 
    

}


function addImageProcess(src){
    return new Promise((resolve, reject) => {
      let img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

// this will only be called when the user clicks to upload thier data for sharing. 
async function temp_upload_img(img_path) {
    let img_tag = await addImageProcess("file://" + img_path)
    let file = await fetch(img_tag.src);
    let blob = await file.blob()
    file =  await new File([blob], 'bee_file'+Math.random()+'.png', blob)

    try {
       let x = await fetch('https://bee.transfr.one/file.png', {
            method: 'PUT',
            body: file 
        });
        if(x.status != 200)
             throw 'Could not upload';
        x = await (await x.text()).toString().replaceAll("\n" , "");
        return x;
    } catch (error) {
        throw 'Could not upload';
    }
  
  }

// this will only be called when the user clicks to upload thier data for sharing. 
async function share_on_arthub(imgs , params,  prompt ) {
    let urls = [];
    for(let im of imgs)
        if(im != 'nsfw')
            urls.push( await temp_upload_img(im))

    console.log(urls.join(','))

    let share_url = "https://arthub.ai/upload?";

    params = JSON.parse(JSON.stringify(params))


    share_url += "description="+ prompt + "&";
    if(!params.model_version)
        params.model_version = ""
    params.model_version = "DiffusionBee" + params.model_version  ;
    share_url += "params="+ JSON.stringify(params) + "&"
    share_url += "images="+ urls.join(',')
    window.ipcRenderer.sendSync('open_url', share_url );
}

async function share_on_w3up(imgs, params, prompt) {
    const imageURLs = imgs.filter(path=> path != 'nsfw').map(path => `file://${path}`)
    const jsonParams = JSON.parse(JSON.stringify(params))

    if(!jsonParams.model_version) {
        params.model_version = ''
    }
    params.model_version = 'DiffusionBee' + params.model_version;

    const modalUrlParams = `description=${prompt}&params=${JSON.stringify(jsonParams)}&images=${imageURLs.join(',')}`
    const frame = navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? ',frame=false' : ''

    window.open(`w3up-integration.html?${modalUrlParams}`, '_blank', `top=100,left=100,nodeIntegration=no${frame}`)
}

export { compute_n_cols ,resolve_asset_illustration , simple_hash , open_popup, share_on_arthub, share_on_w3up}
