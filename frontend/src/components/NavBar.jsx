import Logo from "../assets/logo.png";

function NavBar() {
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 
                   w-[90%] max-w-6xl z-50 
                   backdrop-blur-xl bg-gray-900/70 border border-gray-700 
                   rounded-2xl shadow-xl transition-all duration-300 
                   hover:shadow-2xl hover:-translate-y-0.5">
      <div className="flex justify-between items-center px-6 py-3">
        {/* Logo only */}
        <img
          src={Logo}
          alt="SkillSync Logo"
          className="h-10 w-auto object-contain scale-125"
          style={{ minHeight: '2.5rem', borderRadius: '1vh' }}
        />


        {/* Right-side link */}
        <a
          href="https://github.com/shubhook/skillsync.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 rounded-lg bg-indigo-500 text-white 
                    hover:bg-indigo-600 transition-all text-sm font-medium"
          style={{padding: "10px"}}
        >
          GitHub
        </a>
      </div>
    </nav>
  );
}

export default NavBar;
