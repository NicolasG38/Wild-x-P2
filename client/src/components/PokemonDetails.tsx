import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import typeColors from "./TypeColors";
import "./PokemonDetails.css";
import "charts.css";

interface PokemonDetails {
  name: string;
  id: number;
  types: {
    type: {
      name: string;
    };
  }[];
  sprites: {
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
  species: {
    url: string;
  };
  moves: { move: { name: string } }[]; // Ajout des attaques
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[]; // Ajout des stats
}

interface EvolutionChain {
  species: {
    name: string;
    image: string;
  };
  evolves_to: EvolutionChain[];
}

function PokemonDetails() {
  const { name } = useParams(); // Récupère le paramètre 'name' depuis l'URL
  const [pokemon, setPokemon] = useState<PokemonDetails | null>(null);
  const [funFact, setFunFact] = useState<string | null>(null);
  const [evolution, setEvolution] = useState<{ name: string; image: string }[]>(
    [],
  );

  useEffect(() => {
    // Fetch les données du Pokémon en utilisant l'API
    if (name) {
      fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
        .then((response) => response.json())
        .then((data: PokemonDetails) => {
          setPokemon(data);
          return fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`);
        })
        .then((res) => res.json())
        .then((speciesData) => {
          return fetch(speciesData.evolution_chain.url);
        })
        .then((res) => res.json())
        .then((evoData) => {
          const evoList: string[] = [];
          const traverse = (node: EvolutionChain) => {
            evoList.push(node.species.name);

            for (const child of node.evolves_to) {
              traverse(child);
            }
          };

          traverse(evoData.chain);

          const filtered = evoList.filter(
            (evoName) => evoName !== name.toLowerCase(),
          );

          Promise.all(
            filtered.map((evoName) =>
              fetch(`https://pokeapi.co/api/v2/pokemon/${evoName}`).then(
                (res) => res.json(),
              ),
            ),
          ).then((evoDataArray) => {
            const formatted = evoDataArray.map((evo) => ({
              name: evo.name,
              image: evo.sprites.other["official-artwork"].front_default,
            }));
            setEvolution(formatted);
          });

          fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`)
            .then((response) => response.json())
            .then((data) => {
              const flavorText = data.flavor_text_entries[0].flavor_text;
              setFunFact(flavorText);
            });
        });
    }
  }, [name]); // Re-exécuter l'effet lorsque 'name' change

  if (!pokemon) return <p>Loading...</p>; // Affichage de "loading" tant que les données ne sont pas chargées

  return (
    <section className="pokemon-details">
      <section className="pokemon-header">
        <section>
          <h1 className="pokemon-name-title">
            {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
          </h1>
          <img
            className="pokemon-img"
            src={pokemon.sprites.other["official-artwork"].front_default}
            alt={pokemon.name}
          />
        </section>

        <section className="pokemon-header-type">
          <section className="pokemon-header-type-number">
            <p>
              {pokemon.types.map((t) => (
                <span
                  className="pkmTypes"
                  key={t.type.name}
                  style={{
                    backgroundColor:
                      typeColors[t.type.name as keyof typeof typeColors],
                  }}
                >
                  {t.type.name}
                </span>
              ))}
            </p>
            <p>N°{String(pokemon.id).padStart(4, "0")}</p>
          </section>
          {/* Affichage du fun fact */}
          {funFact && (
            <section className="pokemon-funfact">
              <h2 className="pokemon-title">Fun Fact</h2>
              <p className="pokemon-funfact-text">{funFact}</p>
            </section>
          )}
          {/* Ajout des attaques */}
          <section className="pokemon-attack">
            <h2 className="pokemon-title">Moves</h2>
            <ul className="pokemon-capacity-attack">
              {pokemon.moves.slice(0, 4).map((move) => (
                <li className="pokemon-attack-li" key={move.move.name}>
                  {move.move.name}
                </li> // Affiche le nom de chaque attaque
              ))}
            </ul>
          </section>
        </section>
      </section>
      {/* Affichage des stats */}
      <section className="pokemon-stats">
        <h2 className="pokemon-title">Stats</h2>
        <section id="statsSection">
          <table className="charts-css column show-labels datasets-spacing-5 data-start statsTable">
            <tbody>
              <tr>
                {pokemon.stats.map((stat) => (
                  <td
                    key={stat.stat.name}
                    style={
                      {
                        "--size": `${stat.base_stat} / 110`,
                        backgroundColor:
                          typeColors[
                            pokemon.types[0].type
                              .name as keyof typeof typeColors
                          ],
                      } as React.CSSProperties
                    }
                    className="statCol"
                  >
                    {stat.base_stat / 100 > 0.45 ? (
                      <span className="data">{stat.stat.name}</span>
                    ) : (
                      ""
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </section>
      </section>
      {/* Affichage de l'évolution */}
      {evolution.length > 0 ? (
        <section className="pokemon-evolution">
          <h2 className="pokemon-evolution-title">Evolutions</h2>
          <section className="pokemon-evolution-list">
            {evolution.map((evo) => (
              <>
                <section className="pokemon-evo-img-name" key={evo.name}>
                  <Link to={`/pokemonDetails/${evo.name}`}>
                    <img
                      className="pokemon-evo-img"
                      src={evo.image}
                      alt={evo.name}
                    />
                    <p className="pokemon-evo-name">
                      {evo.name.charAt(0).toUpperCase() + evo.name.slice(1)}
                    </p>
                  </Link>
                </section>
              </>
            ))}
          </section>
        </section>
      ) : (
        <p>This Pokémon doesn't evolve</p>
      )}
    </section>
  );
}

export default PokemonDetails;
