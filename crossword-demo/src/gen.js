import clg from 'crossword-layout-generator'

let isInitialized = false
let words
let char_dict

async function genarate(char_count) {
    if (isInitialized) return Promise.resolve(generate_crossword(false, char_count, words, char_dict))
    isInitialized = true

    function load(text) {
        const lines = text.toString().split('\n').slice(8);
        const capitalize = {
            'ぁ': 'あ',
            'ぃ': 'い',
            'ぅ': 'う',
            'ぇ': 'え',
            'ぉ': 'お',
            //'っ': 'つ',
            //'ゃ': 'や',
            //'ゅ': 'ゆ',
            //'ょ': 'よ',
            'ゎ': 'わ'
        }
        // [Regex Tester - Javascript, PCRE, PHP](https://www.regexpal.com/)
        const lines2 = lines.map(line => line.split('\t')[0])
            .filter(word => word.length <= 8)
            .filter(word => word.length >= 4)
            .filter(word => word.match(/^[ぁ-わをんー]+$/))
            .filter(word => !word.match(/^([ぁ-わをんー]{1,2})\1$/))
            .filter(word => !word.match(/^([ぁ-わをんー]{1})\1\1$/))
            .filter(word => !word.match(/くん$/))
            .map(word => word.split("")
                .map(char => {
                    if (capitalize[char]) {return capitalize[char]}
                    else {return char}
                })
                .join("")
            )

        const valid_words = Array.from(new Set(lines2))

        const characters = valid_words.reduce((a, b) => a + b)
        const note = {}
        for (let i = 0; i < characters.length; i++) {
            const char = characters[i]
            let char_count = note[char] == null ? 1 : note[char] + 1
            note[char] = char_count
        }
        return [valid_words, note]
    }

    return fetch('dic-nico-intersection-pixiv.txt')
        .then(async response => [words, char_dict] = load(await response.text()))
        .then(() => generate_crossword(false, char_count, words, char_dict))
}

function generate_crossword(isConsole, char_count, words, char_dict) {
    function choose_n(arr, num) {
        function choose(arr) {
            const total = Object.values(arr).reduce((a, b) => a + b)
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

    const n_char = choose_n(char_dict, char_count)

    const filtered_words = words.filter(word => word.split("").map(c => n_char.includes(c)).reduce((a, b) => a && b))

    // visualize

    function convert_to_json(word_list) {
        var json_data = [];
        for (let i in word_list) {
            if (word_list[i].length > 0) {
                json_data[i] = { "answer": word_list[i].toLowerCase() }
            }
        }

        return json_data;
    }

    const input_json = convert_to_json(filtered_words)

    // Output data
    const layout = clg.generateLayout(input_json)

    if (isConsole) {
        const output_html = layout.table_string.replace(/-/g, '⬛').replace(/<br>/g, '\n')
        console.log(output_html)
    } else {
        return layout.table
    }
}

export { genarate }
