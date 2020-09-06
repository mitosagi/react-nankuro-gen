const fs = require('fs');
const layoutgen = require('./layout_generator')

const dictionary_path = "dict/dic-nico-intersection-pixiv.txt"
const text = fs.readFileSync(dictionary_path, 'utf8');
const lines = text.toString().split('\n').slice(8);
// console.log(lines.length)

// [Regex Tester - Javascript, PCRE, PHP](https://www.regexpal.com/)
const lines2 = lines.map(line => line.split('\t')[0])
    .filter(word => word.match(/^[ぁ-んー]+$/))
    .filter(word => !word.match(/^([ぁ-んー]{1,2})\1$/))
    .filter(word => !word.match(/くん$/))
    .filter(word => word.length <= 8)
    .filter(word => word.length >= 4)
const valid_words = Array.from(new Set(lines2))
// console.log(valid_words.length)

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

const output_path = "temp.txt"
fs.writeFileSync(output_path, filtered_words.join('\n'), 'utf8');

// visualize

function convert_to_json(word_list) {
    var json_data = [];
    for (let i in word_list) {
        if (word_list[i].length > 0) {
            json_data[i] = { "answer": word_list[i].toLowerCase() };
        }
    }

    return json_data;
}

const input_json = convert_to_json(filtered_words);

// Output data
const layout = layoutgen.generateLayout(input_json);
const output_html = layout.table_string.replace(/-/g, '⬛').replace(/<br>/g, '\n')
console.log(output_html)
