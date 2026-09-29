import { WebGLBackground } from "./components/WebGLBackground";

export default function App() {
  return (
    <main className="relative min-h-screen text-white">
      <WebGLBackground />

      <section className="relative z-10 h-screen flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9]">
          Performance <br /> Impecável
        </h1>
        <p className="text-gray-300 text-lg mt-6 font-light max-w-xl">
          Role para explorar as linhas oficiais do catálogo Auto Mix.
        </p>
        <div className="w-[1px] h-24 bg-gradient-to-b from-white/50 to-transparent mt-12" />
      </section>
    </main>
  );
}