const fs = require('fs');
const path = require('path');

const __strip = (str) => {
	str = str.replace(/\'/g,'');
	str = str.replace(/\"/g,'');
    str = str.replace(/;/g,'');
    return str;
}

const __writeFile = (file,data) => {
	try{
		console.log("FILE", file)
		console.log("DATA", data)
		fs.writeFileSync(file, JSON.stringify(data, null, 4),{flag:'a+'});
		return true;
	} catch(e) {
		console.log("Could not write to file")
		return false;
	}
}
const __getFile = (file) => {
	try{
		const allFileContents = fs.readFileSync(file, 'utf-8');
		return allFileContents;
	} catch(e) {
		console.log("Could not read from file")
		return undefined;
	}
}

const __myRecursion = (file) => {

	try {
		allFileContents = __getFile(file)
		if ( __getFile(file) === undefined) {
			let rePath = file.split(".");
			allFileContents = __getFile(file[file.length-2] + '/index.js')
		}
		if(allFileContents !== undefined) {
		let component = [];
		allFileContents.split(/\r?\n/).forEach(line =>  {
			if (line.includes('import') && line.charAt(0) !== "/") {
		 	   let full_string = line.split(' ');
			   if( full_string[1].includes("{") ) {
					let brace_index = full_string.indexOf("}");
					let temp = [];
					let temp_string = "";
						full_string.map((v,i) => {
							if( i >= 1  && i <= brace_index ) { temp_string += v }
							if( i === brace_index) { temp.push(temp_string) } 
							if( i <1 || i > brace_index) { temp.push(v) }
						})
				   full_string = temp;
			   }
		 	   component.push({ componenet: (full_string[1].includes(".")) ? "unknown" : __strip( full_string[1]),
		 	                    path: (full_string[2] !== undefined && full_string[2] === 'from') ? __strip(full_string[3]) : __strip(full_string[1]) })
		 	}
		});
		let object = { file: file, components: component }
		__writeFile("./changes.json", object);
		    if( component.length > 0 ) {
		        component.map((c) => {
		            //file = file.replace(/`${file.split('\/').pop()}`/g,'');
		            if(c.path.charAt(0) === ".") {
		                let paths = path.join(file,"../",c.path)
		                let arr = paths.split('.');
		                if(arr[arr.length-1] !== undefined &&  arr.length === 1 && arr[arr.length-1] !== "js") {
		                    paths = paths + ".js";
		                    return JSON.stringify(object,null,2) + __myRecursion("./" + paths)
		                }
		            }
		        })
		    }else{
				return JSON.stringify(object, null, 2);
			}
		}
	}catch(e) {
		console.log("doing nothing right now")		
	}
}


const main = (file) => {
	let main_tree = __getFile('./changes.json');
	let data = __myRecursion(file);
	console.log(data);
}

main('./starter-react/src/App.js');
