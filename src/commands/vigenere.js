const command = {
  name: 'vigenere',
  run: async toolbox => {
    const { print } = toolbox

    print.highlight('Trabalho 1 da disciplina de Segurança de Sistemas')
    print.info('Guilherme Rizzotto')
    print.info('2021')
  }
}

module.exports = command
