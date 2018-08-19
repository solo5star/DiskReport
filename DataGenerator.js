const fs = require('fs');

class Directory{
	constructor(fullname){
		this._name = fullname.replace(/^.*[\\\/]/, '');
		this._fullname = fullname;
		this._files = {};
		this._size = 0;
	}

	attr(_attr, _var){
		if(_var){ this['_' + _attr] = _var; return this; }
		else return this['_' + _attr];
	}

	name(_name){
		return this.attr("name", _name);
	}

	fullname(_fullname){
		return this.attr("fullname", _fullname);
	}

	extension(){
		return "directory";
	}

	type(_type){
		return this.attr("type", _type);
	}

	size(_size){
		return this.attr("size", _size);
	}

	add(content){
		var type = "etc";
		switch(content.extension()){
			case "directory":
				type = "directory";
				break;
			case "mp3":
			case "wav":
				type = "music";
				break;
			case "mp4":
			case "mkv":
				type = "video";
				break;
			case "pdf":
				type = "pdf";
				break;
			case "doc":
			case "docx":
				type = "document";
				break;
			case "ppt":
			case "pptx":
				type = "powerpoint";
				break;
			case "png":
			case "jpg":
				type = "picture";
				break;
			case "xlsx":
			case "xls":
			case "csv":
			case "tsv":
				type = "excel";
				break;
		}
		content.type(type);
		if(!(type in this._files)){
			this._files[type] = {
				name: type,
				type: type,
				files: []
			};
		}
		this._files[type].files.push(content);
		this._size += content.size();
	}

	json(){
		var files = [];
		for(var type in this._files){
			this._files[type].files = this._files[type].files.map(content => content.json());
		}
		return {
			name: this._name,
			type: this._type || "directory",
			fullname: this._fullname,
			// size: this._size,
			files: Object.values(this._files)
		};
	}
}

class File{
	constructor(fullname){
		this._name = fullname.replace(/^.*[\\\/]/, '');
		this._fullname = fullname;
		this._extension = fullname.split(".").pop().toLowerCase();
	}

	attr(_attr, _var){
		if(_var){ this['_' + _attr] = _var; return this; }
		else return this['_' + _attr];
	}

	name(_name){
		return this.attr("name", _name);
	}

	fullname(_fullname){
		return this.attr("fullname", _fullname);
	}

	extension(_extension){
		return this.attr("extension", _extension);
	}

	type(_type){
		return this.attr("type", _type);
	}

	size(_size){
		return this.attr("size", _size);
	}

	atime(_atime){
		return this.attr("atime", _atime);
	}

	mtime(_mtime){
		return this.attr("mtime", _mtime);
	}

	ctime(_ctime){
		return this.attr("ctime", _ctime);
	}

	birthtime(_birthtime){
		return this.attr("birthtime", _birthtime);
	}

	json(){
		return {
			name: this._name,
			type: this._type || "file",
			fullname: this._fullname,
			size: this._size,
			atime: this._atime,
			mtime: this._mtime,
			ctime: this._ctime,
			birthtime: this._birthtime
		};
	}
}

function scan(dir, done){
	fs.readdir(dir.fullname(), function(err, list){
		if(err) return console.log(err);

		var pending = list.length;

		if(!pending) return done(null, dir);

		list.forEach(function(name){
			var fullname = dir.fullname() + '/' + name;

			fs.stat(fullname, function(err, stat){
				if(err) return console.log(err);

				if(stat && stat.isDirectory()){
					var content = new Directory(fullname);

					scan(content, function(err){
						dir.add(content);

						if(!--pending){
							done(null);
						}
					});
				}else{
					var content = new File(fullname);
					content.size(stat.size);
					content.atime(stat.atimeMs);
					content.mtime(stat.mtimeMs);
					content.ctime(stat.ctimeMs);
					content.birthtime(stat.birthtimeMs);

					dir.add(content);

					if(!--pending) done(null);
				}
			})
		});
	});
}

var root_dir = new Directory('C:/Users/solo_/Desktop/객체지향프로그래밍');

scan(root_dir, function(err){
	save(root_dir.json());
});

function save(data){
	console.log("Write file...");
	fs.writeFile('data.json', JSON.stringify(data), 'utf8', function(err){
		if(err) throw err;

		console.log("Write success");
	});
};