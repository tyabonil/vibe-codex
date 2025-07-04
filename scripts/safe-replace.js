const fs = require('fs');

function safeReplace(filePath, oldString, newString) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const fileLines = fileContent.split('\n');

        const oldStringLines = oldString.split('\n');
        const newStringLines = newString.split('\n');

        let matchIndex = -1;
        for (let i = 0; i < fileLines.length; i++) {
            let match = true;
            for (let j = 0; j < oldStringLines.length; j++) {
                if (i + j >= fileLines.length || fileLines[i + j] !== oldStringLines[j]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                matchIndex = i;
                break;
            }
        }

        if (matchIndex !== -1) {
            fileLines.splice(matchIndex, oldStringLines.length, ...newStringLines);
            const newFileContent = fileLines.join('\n');
            fs.writeFileSync(filePath, newFileContent, 'utf8');
            console.log(`✅ Successfully replaced content in ${filePath}`);
        } else {
            console.error(`❌ Could not find the specified content to replace in ${filePath}`);
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error replacing content:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    const [filePath, oldString, newString] = process.argv.slice(2);
    if (!filePath || !oldString || !newString) {
        console.error('Usage: node safe-replace.js <filePath> <oldString> <newString>');
        process.exit(1);
    }
    safeReplace(filePath, oldString, newString);
}

module.exports = { safeReplace };
