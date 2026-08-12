"use client";

export default function WelcomeCard() {

    const hour = new Date().getHours();

    let greeting = "Selamat Malam";

    if (hour < 11) greeting = "Selamat Pagi";
    else if (hour < 15) greeting = "Selamat Siang";
    else if (hour < 18) greeting = "Selamat Sore";

    return (

        <div
            className="
            rounded-3xl
            bg-gradient-to-r
            from-indigo-600
            to-violet-600
            text-white
            p-8
            shadow-lg
        "
        >

            <p className="text-lg opacity-80">

                {greeting},

            </p>

            <h1
                className="
                text-3xl
                font-bold
                mt-2
            "
            >

                Rahmat 👋

            </h1>

            <p
                className="
                mt-4
                text-indigo-100
                max-w-2xl
            "
            >

                Selamat datang di Admin Dashboard Website Change Detection.
                Kelola seluruh monitoring website, pengguna,
                notifikasi, dan aktivitas sistem dari satu dashboard.

            </p>

        </div>

    );

}