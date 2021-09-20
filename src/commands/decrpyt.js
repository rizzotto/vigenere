const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')

function indexOfCoincidence(string) {
  let length = 0
  let freqI = 0

  alphabet.forEach(letter => {
    // https://stackoverflow.com/questions/881085/count-the-number-of-occurrences-of-a-character-in-a-string-in-javascript?rq=1
    const count = (string.match(new RegExp(letter, 'g')) || []).length

    if (count > 0) {
      length += count
      freqI += count * (count - 1)
    }
  })

  const n = length * (length - 1)

  // calcula o indice
  return freqI / n
}

function getKeySize(cipherText, icLanguage, print) {
  for (let j = 0; j < alphabet.length; j++) {
    let ic = undefined
    let calculatedIC = undefined
    for (let i = 0; i < j; i++) {
      let string = ''
      cipherText.split('')

      for (let k = j; k < cipherText.length; k = k + j) {
        string += cipherText[k]
      }

      ic = indexOfCoincidence(string).toFixed(6)
      calculatedIC = ic - icLanguage

      if (calculatedIC <= 0.008 && calculatedIC > 0) {
        print.table(
          [
            ['Tamanho', 'IC', 'Tamanho achado?'],
            [j, ic, calculatedIC <= 0.008 && calculatedIC > 0]
          ],
          {
            format: 'lean',
            style: { 'padding-left': 0, 'padding-right': 8 }
          }
        )
        print.success(
          `Possível tamanho da chave encontrado: ${j} para IC da lingua ${icLanguage}`
        )
        return j
      }
    }
    if (ic !== undefined) {
      print.table(
        [
          ['Tamanho', 'IC', 'Tamanho achado?'],
          [j, ic, calculatedIC <= 0.008 && calculatedIC > 0]
        ],
        {
          format: 'lean',
          style: { 'padding-left': 0, 'padding-right': 8 }
        }
      )
    }
  }
}

function getSubStrings(keySize, cipherText) {
  let array = []
  cipherText.split('').forEach((l, index) => {
    const position = index % keySize
    let string = array[position]
    string
      ? array.splice(position, 1, `${string}${l}`)
      : array.splice(position, 1, l)
  })
  return array
}

function getFrequentLetter(str) {
  let frequentChar = ''
  let charCount = 0

  alphabet.forEach(char => {
    const currentCount = (str.match(new RegExp(char, 'g')) || []).length
    if (currentCount > charCount) {
      frequentChar = char
      charCount = currentCount
    }
  })

  return frequentChar
}

function calculateKey(substringsArray, commonChar) {
  let key = ''
  let frequentCharsArray = []
  substringsArray.forEach((substring, index) => {
    frequentCharsArray.push(getFrequentLetter(substring))
    const charDisplacement =
      alphabet.indexOf(frequentCharsArray[index]) - alphabet.indexOf(commonChar)

    if (charDisplacement < 0) charDisplacement += alphabet.length
    key += alphabet[charDisplacement]
  })

  return key
}

function decifreText(key, cipherText, toolbox) {
  let text = ''
  let index = 0
  const spinner = toolbox.print.spin('Decifrando texto')
  cipherText.split('').forEach(char => {
    if (index == key.length) index = 0
    let decryptedChar = alphabet.indexOf(char) - alphabet.indexOf(key[index])

    // mesmo de antes, caso o valor for negativo
    if (decryptedChar < 0) {
      decryptedChar = decryptedChar + alphabet.length
    }
    text += alphabet[decryptedChar]
    index++
  })
  try {
    toolbox.filesystem.write('./src/texts/decryptedText.txt', text)
    spinner.succeed(
      'Texto decifrado criado em: `./src/texts/decryptedText.txt`'
    )
  } catch (e) {
    spinner.fail('Texto nao decifrado :(')
  }
}

const command = {
  name: 'decrypt',
  description:
    'parameters:\n- file_path\n- common_language_char\nflags:\n- language: (pt|en)',
  run: async toolbox => {
    const { filesystem, print, parameters } = toolbox
    if (toolbox.filesystem.exists(parameters.first) === false) {
      print.error('Informe um arquivo válido')
      return
    }
    const filePath = parameters.first
      ? parameters.first
      : './src/texts/cipher1.txt'
    const commonChar = parameters.second ? parameters.second : 'e'
    const icPT = 0.074
    const icEN = 0.066

    const ic = parameters.options.language === 'en' ? icEN : icPT

    const cipherText = filesystem.read(filePath)
    const keySize = getKeySize(cipherText, ic, print)

    let substringsArray = getSubStrings(keySize, cipherText)
    const key = calculateKey(substringsArray, commonChar, print)
    print.highlight(`Possível chave:  ${key}`)
    decifreText(key, cipherText, toolbox)
  }
}

module.exports = command
