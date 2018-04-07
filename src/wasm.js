/* global WebAssembly */

export class WasmWrapper {
  constructor(url, callback) {
    this.create_world = this.create_world.bind(this);
    this.get_view = this.get_view.bind(this);
    this.press_key = this.press_key.bind(this);
    this.allocate = this.allocate.bind(this);
    this.read = this.read.bind(this);
    this.deallocate = this.deallocate.bind(this);

    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder("utf-8");

    fetch(url)
      .then(r => r.arrayBuffer())
      .then(r => WebAssembly.instantiate(r, { env: {
          /*abortStackOverflow: () => { throw new Error('overflow'); },
          table: new WebAssembly.Table({ initial: 0, maximum: 0, element: 'anyfunc' }),
          tableBase: 0,
          memory: memory,
          memoryBase: 1024,
          STACKTOP: 0,
          STACK_MAX: memory.buffer.byteLength,*/
          roundf: Math.round,
          print_raw: (ptr) => {
            const txt = this.read(ptr);
            console.log(txt);
            this.deallocate(ptr);
          }
        }}))
      .then(wasm_module => {
        this.module = wasm_module;
        this.instance = wasm_module.instance;
        this.create_world();
        callback();
      });
  }

  create_world() {
    this.world_ptr = this.instance.exports.create_world();
  }

  get_messages(count) {
    let result_ptr = this.instance.exports.get_messages(this.world_ptr, count);
    let result = this.read(result_ptr);
    this.deallocate(result_ptr);
    return JSON.parse(result);
  }

  get_view() {
    let result_ptr = this.instance.exports.get_view(this.world_ptr);
    let result = this.read(result_ptr);
    this.deallocate(result_ptr);
    return JSON.parse(result);
  }

  press_key(key) {
    let key_ptr = this.allocate(key);
    this.instance.exports.press_key(this.world_ptr, key_ptr);
    this.deallocate(key_ptr);
  }

  allocate(str) {
    const utf8 = this.encoder.encode(str);

    const linearMemory = this.instance.exports.memory;
    const offset = this.instance.exports.allocate(utf8.length);
    const target = new Uint8Array(linearMemory.buffer, offset, utf8.length);

    target.set(utf8);
    return offset;
  }

  read(ptr) {
    const buf = new Uint8Array(this.instance.exports.memory.buffer, ptr);
    let nul = 0;
    while (buf[nul] !== 0)
      nul++;
    const utf8buf = new Uint8Array(this.instance.exports.memory.buffer, ptr, nul);
    return this.decoder.decode(utf8buf);
  }

  deallocate(ptr) {
    this.instance.exports.deallocate(ptr);
  }

}
