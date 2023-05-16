const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = []
const numPagesBtn = 5;


const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty()

  const startPage = Math.max(1, currentPage-Math.floor(numPagesBtn/2));
  const endPage = Math.min(numPages, currentPage+Math.floor(numPagesBtn/2));


  if (currentPage > 1) {
    $('#pagination').append(`
    <button type="button" class="btn btn-primary page ml-1 numberedButtons" value="${currentPage - 1}">Prev</button>
    `)
  }


  for (let i = startPage; i <= endPage; i++) {
    var active = "";
    if (i == currentPage) {
      active = "active";
    }

    $('#pagination').append(`
    <button type="button" class="btn btn-primary page ml-1 ${active} numberedButtons" value="${i}">${i}</button>
    `)
  }

  if (currentPage < numPages) {
    $('#pagination').append(`
    <button type="button" class="btn btn-primary page ml-1 numberedButtons" value="${currentPage + 1}">Next</button>
    `)
  }

}

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  $('#pokeCards').empty()
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
      </div>  
    `)
  })

  const totalPokemons = pokemons.length;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalPokemons);
  const displayedPokemons = endIndex - startIndex;

  $('#displayedPokemons').text(`Showing ${displayedPokemons} of ${totalPokemons} pokemons`);
}


const setupFilters = async () => {
  // Add event listener to type filters
  $('.typeFilter').change((e) => {
    const selectedTypes = $('.typeFilter:checked').map((_, checkbox) => checkbox.value).get();

    // Filter the Pokémon based on the selected type(s)
    if (selectedTypes.length === 0) {
      // No type selected, show all Pokémon
      currentPage = 1;
      paginate(currentPage, PAGE_SIZE, pokemons);
      const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
      updatePaginationDiv(currentPage, numPages);
      const totalPokemons = pokemons.length;
      $('#displayedPokemons').text(`Showing ${Math.min(totalPokemons, PAGE_SIZE)} of ${totalPokemons} pokemons`);
    } else {
      // Filter by the selected type(s)
      const filteredPokemons = pokemons.filter((pokemon) => {
        const pokemonTypes = pokemon.types.map((type) => type.type.name);
        return selectedTypes.some((type) => pokemonTypes.includes(type));
      });
      currentPage = 1;
      paginate(currentPage, PAGE_SIZE, filteredPokemons);
      const numPages = Math.ceil(filteredPokemons.length / PAGE_SIZE);
      updatePaginationDiv(currentPage, numPages);
      const totalPokemons = filteredPokemons.length;
      $('#displayedPokemons').text(`Showing ${Math.min(totalPokemons, PAGE_SIZE)} of ${totalPokemons} pokemons`);
    }
  });
};






const setup = async () => {
  // test out poke api using axios here


  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;

  setupFilters();


  const totalPokemons = pokemons.length;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalPokemons);
  const displayedPokemons = endIndex - startIndex;

  $('#displayedPokemons').text(`Showing ${displayedPokemons} of ${totalPokemons} pokemons`);

  paginate(currentPage, PAGE_SIZE, pokemons)
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)



  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  // add event listener to pagination buttons
  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value)
    paginate(currentPage, PAGE_SIZE, pokemons)

    //update pagination buttons
    updatePaginationDiv(currentPage, numPages)
  })

}


$(document).ready(setup)