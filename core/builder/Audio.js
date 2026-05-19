const fs = require('fs');
const audiosprite = require('audiosprite');

const config = require('../../config');

module.exports.load = function() {
	fs.readdir('assets/audio', (err, names) => {
        if (err) {
            this.audioLoaded = true;
            this.loadChunck();
            return;
        }
        
        let audio = false;
        for (const title of names) {
            const type = title.slice(title.length - 3, title.length);
            (type === 'mp3') ? audio = true : fs.unlinkSync('assets/audio/' + title);
        }

        let files = [];
        for (const title of names) {
            const name = title.slice(0, -4);
            this.isCurrentVersionAsset(name, 'audio') && files.push('assets/audio/' + title);
        }

        if(names.length === 0 || files.length === 0 || !audio) {
            this.audioLoaded = true;
            this.loadChunck();

            return;
        }

        let opts = {
            output: 'temp/audio',
            export: 'm4a,ogg',
            bitrate: config.compressAudio ? 32 : 128
        }
        
        audiosprite(files, opts, (err, obj) => {
            if (err) {
                console.log('Audio processing failed, skipping:', err.message);
                this.audioLoaded = true;
                this.loadChunck();
                return;
            }
            
            this.resources += 'window.App.resources.audio.' + 'json' + ' = ' + JSON.stringify(obj) + ';';

            fs.readFile('temp/audio.ogg', (err, file) => {
                if (err) {
                    this.audioLoaded = true;
                    this.loadChunck();
                    return;
                }
                
                const ogg = file.toString('base64');
                this.resources += 'window.App.resources.audio.' + 'ogg' + ' = ' + "'" + ogg + "'" + ';';

                fs.readFile('temp/audio.m4a', (err, file) => {
                    const m4a = file.toString('base64');
                    this.resources += 'window.App.resources.audio.' + 'm4a' + ' = ' + "'" + m4a + "'" + ';';
                    
                    this.audioLoaded = true;
                    this.loadChunck();
                });
            });
        })
    });
}