import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import WildexlogoV1 from "/assets/images/WildexlogoV1.png";
import BurgerMenu from "./BurgerMenu";

function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pokemons, setPokemons] = useState<{ name: string; url: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPokemons = async () => {
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=1025",
      );
      const data = await response.json();
      setPokemons(data.results);
    };
    fetchPokemons();
  }, []);

  const handleSearch = () => {
    const found = pokemons.find(
      (pokemon) => pokemon.name.toLowerCase() === searchQuery.toLowerCase(),
    );

    if (found) {
      navigate(`/pokemonDetails/${found.name}`); // <-- Redirection vers la page du Pokémon
    } else {
      alert("No pokemon found !");
    }
  };

  return (
    <header>
      <section className="burger-logo-search">
        <BurgerMenu />
        <section className="section-menu-burger">
          <Link to={"/"}>
            <img className="logo" src={WildexlogoV1} alt="Logo du site" />
          </Link>
        </section>

        <section className="search-bar">
          <label htmlFor="recherche">Pokémon</label>
          <input
            id="recherche"
            type="text"
            placeholder="Enter it's name here"
            name="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button type="button" onClick={handleSearch}>
            Search
          </button>
        </section>
      </section>
    </header>
  );
}

export default Header;
