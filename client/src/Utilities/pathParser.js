export const pathParser=(id,filestructure)=>{
    let res = '/'
    let end ='/'

    while(filestructure[`${id}`]['PARENT']!==null){
        if(filestructure[filestructure[`${id}`]['PARENT']]['NAME']!=='ROOT'){
            res+= (`${filestructure[filestructure[`${id}`]['PARENT']]['NAME']}`+end);
        }
        id=filestructure[`${id}`]['PARENT']
    }
    let ans=res.split("/").reverse().join("/");
    return ans;
}