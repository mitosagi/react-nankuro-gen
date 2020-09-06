const fs = require('fs');

const dictionary_path = "dict/dic-nico-intersection-pixiv.txt"
const text = fs.readFileSync(dictionary_path, 'utf8');
const lines = text.toString().split('\n').slice(8);
// console.log(lines.length)

const valid_words = lines.map(line => line.split('\t')[0])
    .filter(word => word.match(/^[ぁ-んー]+$/))
    .filter(word => word.length <= 8)
console.log(valid_words.length)

const characters = valid_words.reduce((a, b) => a + b)
const note = {};
for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    let char_count = note[char] == null ? 1 : note[char] + 1;
    note[char] = char_count;
}
// console.log(note)

function choose_n(arr, num) {
    function choose(arr) {
        const total = Object.values(arr).reduce((a, b) => a + b);
        const arrow = Math.random() * total;
        let threshold = 0.0;
        for (const [key, value] of Object.entries(arr)) {
            threshold += value
            if (arrow < threshold) { return key }
        }
    }

    const ret_arr = []
    for (let i = 0; i < num; i++) {
        const choosed = choose(arr)
        delete arr[choosed]
        ret_arr.push(choosed)
    }
    return ret_arr
}

const n_char = choose_n(note, 12 + 3)
console.log(n_char)

const filtered_words = valid_words.filter(word => word.split("").map(c => n_char.includes(c)).reduce((a, b) => a && b))
console.log(filtered_words.length)

function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var r = Math.floor(Math.random() * (i + 1));
        var tmp = array[i];
        array[i] = array[r];
        array[r] = tmp;
    }
}
shuffle(filtered_words)
console.log(filtered_words.slice(0, 4))

const output_path = "temp.txt"
fs.writeFileSync(output_path, filtered_words.join('\n'), 'utf8');
