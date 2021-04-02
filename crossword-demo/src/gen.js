import clg from 'crossword-layout-generator'

let isInitialized = false
let quality_words
let char_freq
let kana_kanji_dict
const str_kuromasu = '-'

async function get_crossword(number_of_char_types) {
    if (isInitialized) {
        return Promise.resolve(generate_crossword(number_of_char_types, quality_words, char_freq))
    } else {
        isInitialized = true
        return fetch('dic-nico-intersection-pixiv.txt')
            .then(async response => [quality_words, char_freq, kana_kanji_dict] = load(await response.text()))
            .then(() => generate_crossword(number_of_char_types, quality_words, char_freq))
    }

    function load(word_list) {
        const lines = word_list.toString().split('\n').slice(8);
        const replace = {
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

        const kana_kanji_dict = {}
        lines.forEach(line => {
            const spl = line.split('\t')
            spl[0] = spl[0].split("").map(char => {
                if (replace[char]) { return replace[char] }
                else { return char }
            }).join("")
            kana_kanji_dict[spl[0]] = spl[1]
        })

        // [Regex Tester - Javascript, PCRE, PHP](https://www.regexpal.com/)
        const quality_words = Array.from(new Set(
            Object.keys(kana_kanji_dict)
                .filter(word => word.length <= 8)
                .filter(word => word.length >= 4)
                .filter(word => word.match(/^[ぁ-わをんー]+$/))
                .filter(word => !word.match(/^([ぁ-わをんー]{1,2})\1$/))
                .filter(word => !word.match(/^([ぁ-わをんー]{1})\1\1$/))
                .filter(word => !word.match(/くん$/))
        ))

        const char_freq = {}
        quality_words.reduce((a, b) => a + b).split('').forEach(char => {
            char_freq[char] = char_freq[char] == null ? 1 : char_freq[char] + 1
        })

        return [quality_words, char_freq, kana_kanji_dict]
    }
}

function generate_crossword(number_of_char_types, words, char_freq) {
    function choose_n(arr, num) {
        const copy_arr = {...arr}
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
            const choosed = choose(copy_arr)
            delete copy_arr[choosed]
            ret_arr.push(choosed)
        }

        return ret_arr
    }

    const n_char = choose_n(char_freq, number_of_char_types)

    const filtered_words = words.filter(word => word.split("").map(c => n_char.includes(c)).reduce((a, b) => a && b))

    function convert_to_json(word_list) {
        var json_data = [];
        for (let i in word_list) {
            if (word_list[i].length > 0) {
                json_data[i] = { "answer": word_list[i].toLowerCase() }
            }
        }

        return json_data;
    }
    
    const table = clg.generateLayout(convert_to_json(filtered_words)).table

    const char_set = new Set(table.reduce((a, b) => a.concat(b)))
    char_set.delete(str_kuromasu)

    return [table, char_set]
}

export { get_crossword, kana_kanji_dict, str_kuromasu }
