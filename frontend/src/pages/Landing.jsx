import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Activity, Zap, Shield, ChevronDown, Instagram, Twitter, Mail, Play } from 'lucide-react';

const Marquee = () => (
    <div className="relative flex overflow-hidden py-4 bg-secondary text-white">
        <motion.div
            className="flex gap-12 whitespace-nowrap font-black text-4xl uppercase tracking-tighter"
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
            {[...Array(10)].map((_, i) => (
                <span key={i} className="flex items-center gap-4">
                    VitalityFit <Zap className="fill-white" /> Train Smart <Activity /> Live Better <Shield />
                </span>
            ))}
        </motion.div>
    </div>
);

const HoverReveal = ({ text, image }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            className="relative inline-block cursor-pointer z-10"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <span className="relative z-20 transition-colors duration-300 hover:text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">
                {text}
            </span>
            <AnimatePresence>
                {isHovered && (
                    <motion.img
                        src={image}
                        alt="Reveal"
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] object-cover rounded-xl shadow-2xl z-10 pointer-events-none"
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const HorizontalScrollSection = () => {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"]
    });

    // Adjusted values to perfectly fill the space without gaps
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"]);

    const cards = [
        {
            title: "AI Analysis",
            desc: "Precision tracking for every rep.",
            img: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&auto=format&fit=crop&q=80",
            id: 1,
        },
        {
            title: "Nutrition",
            desc: "Smart food tracking & macros.",
            img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop&q=80",
            id: 2,
        },
        {
            title: "Community",
            desc: "Join clubs & compete globally.",
            img: "https://images.unsplash.com/photo-1552674605-4695231af15f?w=800&auto=format&fit=crop&q=80",
            id: 3,
        },
        {
            title: "Progress",
            desc: "Visualize your gains over time.",
            img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
            id: 4,
        },
    ];

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-black text-white">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
                    <div className="absolute inset-0">
                        <motion.div
                            className="w-full h-full opacity-30"
                            animate={{
                                backgroundPosition: ['0% 0%', '100% 100%'],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            style={{
                                background: 'linear-gradient(45deg, transparent 30%, rgba(139, 92, 246, 0.1) 50%, transparent 70%)',
                                backgroundSize: '200% 200%'
                            }}
                        />
                    </div>
                    <div className="absolute inset-0">
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-white rounded-full opacity-20"
                                initial={{ x: `${Math.random() * 100}vw`, y: `${Math.random() * 100}vh` }}
                                animate={{
                                    x: [`${Math.random() * 100}vw`, `${Math.random() * 100}vw`],
                                    y: [`${Math.random() * 100}vh`, `${Math.random() * 100}vh`],
                                }}
                                transition={{
                                    duration: 15 + Math.random() * 10,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-10 left-10 z-0 opacity-10">
                    <h1 className="text-[15vw] font-black leading-none text-white">UNSTOPPABLE</h1>
                </div>

                <motion.div style={{ x }} className="flex gap-8 px-8 md:px-24 relative z-10">
                    {/* Intro Card */}
                    <div className="h-[60vh] w-[90vw] md:w-[40vw] flex-shrink-0 flex flex-col justify-center">
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
                            BUILT <br /> <span className="text-secondary">DIFFERENT</span>
                        </h2>
                        <p className="text-lg md:text-xl text-gray-400 max-w-md">
                            Scroll to explore how VitalityFit transforms your fitness journey with cutting-edge technology.
                        </p>
                    </div>

                    {/* Scroll Cards */}
                    {cards.map((card) => (
                        <div key={card.id} className="group relative h-[60vh] w-[90vw] md:w-[40vw] flex-shrink-0 overflow-hidden rounded-3xl bg-gray-900 border border-gray-800">
                            <img
                                src={card.img}
                                alt={card.title}
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex flex-col justify-end">
                                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">{card.title}</h3>
                                <p className="text-base md:text-lg text-gray-300">{card.desc}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

const Landing = () => {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 w-full p-6 flex justify-between items-center z-50 mix-blend-difference text-white">
                <div className="text-2xl font-black tracking-tighter">VITALITY<span className="text-secondary">FIT</span></div>
                <div className="flex gap-6 font-bold text-sm uppercase tracking-widest">
                    <Link to="/login" className="hover:text-secondary transition">Login</Link>
                    <Link to="/register" className="hover:text-secondary transition">Join Now</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative h-screen flex flex-col justify-center items-center text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10"
                >
                    <h1 className="text-[10vw] leading-[0.9] font-black text-text tracking-tighter mb-4">
                        REDEFINE <br />
                        <HoverReveal text="YOUR" image="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=60" />{' '}
                        <HoverReveal text="LIMITS" image="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=60" />
                    </h1>
                    <p className="text-xl md:text-2xl text-muted font-medium max-w-2xl mx-auto mb-8">
                        AI-powered training that adapts to your pace, your goals, and your life.
                    </p>
                    <Link to="/register">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-10 py-4 bg-text text-white rounded-full font-bold text-lg flex items-center gap-3 mx-auto hover:bg-secondary transition-colors"
                        >
                            Start Training <ArrowRight />
                        </motion.button>
                    </Link>
                </motion.div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 text-muted"
                >
                    <ChevronDown className="w-8 h-8" />
                </motion.div>
            </section>

            <Marquee />

            {/* Horizontal Scroll Section */}
            <HorizontalScrollSection />

            {/* Contact / Footer */}
            <footer className="bg-text text-white py-24 px-4 relative overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 relative z-10">
                    <div>
                        <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter">READY TO <br /><span className="text-secondary">SWEAT?</span></h2>
                        <div className="flex gap-4">
                            <a href="#" className="p-4 bg-white/10 rounded-full hover:bg-secondary transition"><Instagram /></a>
                            <a href="#" className="p-4 bg-white/10 rounded-full hover:bg-secondary transition"><Twitter /></a>
                            <a href="#" className="p-4 bg-white/10 rounded-full hover:bg-secondary transition"><Mail /></a>
                        </div>
                    </div>
                    <div className="md:text-right">
                        <h3 className="text-2xl font-bold mb-4">Contact Us</h3>
                        <p className="text-gray-400 mb-2">vitalityhub.991@gmail.com</p>
                        <p className="text-gray-400">+91 8252134851</p>
                        <div className="mt-8">
                            <Link to="/register" className="text-lg font-bold border-b-2 border-secondary hover:text-secondary transition">
                                Get Started Now
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Background Text */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden opacity-5 pointer-events-none">
                    <h1 className="text-[20vw] font-black whitespace-nowrap leading-none">VITALITY</h1>
                </div>
            </footer>
        </div>
    );
};

export default Landing;