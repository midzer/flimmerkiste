# Porting games for the web with Emscripten

In this post I want to show a brief overview on how to create game ports in WebAssembly (WASM) via the Emscripten toolchain. This is no detailed example for a specific game or engine, just to get a gist of all steps involved in this process.

It is targeted to be as beginner friendly as possible, but first experience in reading C/C++ is recommended if you jump on a first project yourself.

Let's start this journey by looking for appropriate games or source code, you want to bring to life in a browser.

## Fewer dependencies means more joy

Porting games to different OS or in our case for all modern browsers which support WASM, can be hard up to impossible. Picking the an easy project at the beginning is essential, especially for newcomers.

What is an "easy project"? In short, a repository in C/C++ language and with as few as possible dependencies. Of course, Emscripten offers pre-compiled ports of many popular libraries like [SDL](https://www.libsdl.org/). Let's keep this in our mind, when we talk about it later.

## It should work natively

Incase you found a handy repository, try to build it for your OS first. If this fails already, you *will* be stuck on the web port, too. I highly recommend building on Linux, because the Emscripten toolchain is more similar. Stick to the README and hopefully your game compiles fine.

## Prepare your setup

Well, now it's time to get your gear ready! Go and grab [Emscripten](https://emscripten.org/) and dive at least into the "Getting started" section. More experience is to be earned, the more you play around with this toolset. So let's keep things simple first of all.

## It depends on the build system

There are many build systems around. For this tutorial I focus on CMake.

If there is a `CMakeLists.txt` do

```
mkdir build && cd build
emcmake cmake ..
```

to generate a `Makefile` file. Most likely this is going to throw errors, because of unresolved dependencies. Sometimes, depending on the build script, it can't find SDL2 for example which is `REQUIRED`. So, let's modify `CMakeLists.txt` and remove `REQUIRED` to fit our needs. Yes, we can do it!

## Ready for compile

Previous command finished successfully and we are going to heat up our CPU. Start compiling with `emmake make`.

Now, you could encounter compiler errors. Something external is missing probably. Perhaps SDL2 headers not found? A possible way to fix this is by setting compile flags like this

```
add_compile_options(-sUSE_SDL2)
```

somewhere in `CMakeLists.txt`. Re-run the compile command and check whether it's been working now. Simply put, this way you shim through the whole compilation process. Finally, all source code object files (.o) have been created. Awesome!

## Linking everything together

Using CMake, there are going to be more directories in `/build`. Navigate to a subdirectory where those object files are stored.

```
emcc *.o -o index.html
```

creates a `index.html`, `index.js` and `index.wasm` for a hello-word program. For more complex scenarios, linker errors will most likely occur. You will have to link more dependencies either via additional command line flags (`-sUSE_SDL=2` for SDL2 for example) or as static, pre-compiled `.a` files. Have a looksie at Emscripten's documentation or GitHub issues if you're stuck.

## Run, baby, run

Inside the directory with our output, run

```
python3 -m http.server
```

which opens a simple Webserver on Port 8000. In your browser, you should see Emscripten logo, a HTML5 `canvas` and a logging feature at address `localhost:8000`.

Either the log on the page or your browsers developer console give you more hints about potential errors. The key is to fix all those errors, one after another, by adding those flags to your previous linker step:

* make it async -> `-sASYNCIFY`
* memory out of bounds -> `-sALLOW_MEMORY_GROWTH`
* missing game data -> `--preload-file GAMEDATA`
* more detailed error info -> `-sASSERTIONS`

This is just a very small subset of all flags Emscripten delivers for compile and linking action. This can be very hard depending on the game. Tweaking source code directly is mandatory at some point.

## Final words

In this tutorial I presented a way for newcomers to port applications for the web. Given it's current state, this post functions as an introduction to the whole topic. Proper debugging techniques and optimizations guidelines on the final binary are not considered and could be topic of a future post.

Happy porting!
