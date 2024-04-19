# Porting games for the web with Emscripten

In this post I want to show a brief overview of how to create game ports in WebAssembly (WASM) via the Emscripten toolchain. This is no detailed example for a specific game or engine, it's just to get a gist of all steps involved in this process.

It is targeted to be as beginner friendly as possible, but first, experience in reading C/C++ is recommended if you jump on a first project yourself.

Let's start this journey by looking for appropriate games or source code you want to bring to life in a browser.

## Fewer dependencies means more joy

Porting games to a different OS or in our case for all modern browsers which support WASM, can be hard to impossible. Picking an easy project at the beginning is essential, especially for newcomers.

What is an "easy project"? In short, it's a repository in C/C++ languages and with as few as possible dependencies. Of course, Emscripten offers pre-compiled ports of many popular libraries like [SDL](https://www.libsdl.org/). Let's keep this in mind, when we talk about it later.

## It should work natively

In case you found a handy repository, try to build it for your OS first. If this fails already, you *will* be stuck on the web port too. I highly recommend building on Linux, because the Emscripten toolchain is similar to GCC or Clang. Stick to the README and hopefully your game compiles fine.

## Prepare your setup

Well, now it's time to get your gear ready! Go and grab [Emscripten](https://emscripten.org/) and dive into at least the "Getting Started" section. More experience is to be earned the more you play around with this toolset. So let's start out keeping things simple.

## It depends on the build system

There are many build systems around. For this tutorial I focus on CMake.

If there is a `CMakeLists.txt` do

```
mkdir build && cd build
emcmake cmake ..
```

to generate a `Makefile` file. Most likely this is going to throw errors, because of unresolved dependencies. Sometimes, depending on the build script, it can't find SDL2 for example which is `REQUIRED`. So, let's modify `CMakeLists.txt` and remove `REQUIRED` to fit our needs. Yes, we can do it!

## Ready for compiling

Asumming the previous command finished successfully, we are going to heat up our CPU. Start compiling with `emmake make`.

Now, you could encounter compiler errors. Something external is probably missing. Perhaps SDL2 headers are not found? A possible way to fix this is by setting compiler flags like this

```
add_compile_options(-sUSE_SDL2)
```

somewhere in `CMakeLists.txt`. Re-run the compile command and check whether it's working now. Simply put, you can use this method to shim through the whole compilation process. Finally, all source code object files (.o) have been created. Awesome!

## Linking everything together

Using CMake, there are going to be more directories in `./build`. Navigate to a subdirectory where those object files are stored.

```
emcc *.o -o index.html
```

creates an `index.html`, `index.js` and `index.wasm` for a hello-word program. For more complex scenarios, linker errors will most likely occur. You will have to link more dependencies either via additional command line flags (`-sUSE_SDL=2` for SDL2 for example) or as static, pre-compiled `.a` files. Have a looksie at Emscripten's documentation or GitHub Issues if you're stuck.

## Run, baby, run

Inside the directory with our output, run

```
python3 -m http.server
```

which opens a simple Web Server on Port 8000. In your browser, you should see the Emscripten logo, an HTML5 `canvas` element, and a logging feature at address `localhost:8000`.

Either the log on the page or your browser's developer console can give you more hints about potential errors. The key is to fix all these errors, one after another, by adding those flags to your previous linker step:

* make it async -> `-sASYNCIFY`
* memory out of bounds -> `-sALLOW_MEMORY_GROWTH`
* missing game data -> `--preload-file GAMEDATA`
* more detailed error info -> `-sASSERTIONS`

This is just a very small subset of all flags Emscripten offers for compile and linking actions. This can be very hard depending on the game. Tweaking source code directly is mandatory at some point.

## Final words

In this tutorial I presented a way for newcomers to port applications to the web. Given its current state, this post functions as an introduction to the whole topic. Proper debugging techniques and optimizations on the final binary are not considered and could be topic of interest for a future post.

Happy porting!
