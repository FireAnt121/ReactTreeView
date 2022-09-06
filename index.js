const fs = require('fs');
const path = require('path');

const strip = (str) => {
	str = str.replace(/\'/g,'');
	str = str.replace(/\"/g,'');
    str = str.replace(/;/g,'');
    return str;
}

const _getFile = (file) => {
try{
	const allFileContents = fs.readFileSync(file, 'utf-8');
	return allFileContents;
} catch(e) {
	return undefined;
}
}

const main = (file) => {
	try {
		allFileContents = _getFile(file)
		if ( _getFile(file) === undefined) {
			let rePath = file.split(".");
			allFileContents = _getFile(file[file.length-2] + '/index.js')
		}
		if(allFileContents !== undefined) {
		let component = [];
allFileContents.split(/\r?\n/).forEach(line =>  {
 if (line.includes('import') && line.charAt(0) !== "/") {
    let full_string = line.split(' ');
    component.push({ componenet: (full_string[1].includes(".")) ? "unknown" : strip( full_string[1]),
                       path: (full_string[2] !== undefined && full_string[2] === 'from') ? strip(full_string[3]) : strip(full_string[1]) })
 }
});
let object = { file: file, components: component }
console.log(object);
    if( component.length > 0 ) {
        component.map((c) => {
            //file = file.replace(/`${file.split('\/').pop()}`/g,'');
            if(c.path.charAt(0) === ".") {
                let paths = path.join(file,"../",c.path)
                let arr = paths.split('.');
                if(arr[arr.length-1] !== undefined &&  arr.length === 1 && arr[arr.length-1] !== "js") {
                    paths = paths + ".js";
                    main("./" + paths)
                }
            }
        })
    }
}
}catch(e) {
	
}
}

main('./starter-react/src/App.js');
