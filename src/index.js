import generateJoke from "./generateJoke"
import './styles/main.scss'
import sample from './assets/sample.svg'

generateJoke()

const sampleImage= document.getElementById("sampleImage")
sampleImage.src = sample

const jokeButton = document.getElementById("jokeBtn")
jokeButton.addEventListener('click', generateJoke)