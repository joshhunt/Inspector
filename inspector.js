inspector = (apiKey) => {

  // apiKey for api.braytech.org (to do)

  if (!inspector.init) {

    inspector.init = true;

    $("body").append(`<div id="inspector"></div>`);

  }

  inspector.bind();

}

inspector.bind = () => {

  // bind #inspector mouse position
  // to do: intelligently reposition to prevent "off screen" display
  $(window).on("mousemove.inspector", function(e) {

    var x = 0;
    var y = 0;

    if (e.type == "mousemove") {
      x = e.clientX;
      y = e.clientY;
    }
    
    $("#inspector").css({
      "top": `${ y + 16 }px`,
      "left": `${ x + 16 }px`
    });
    
  });
  
  // if touch primary input, close window on "touch"
  $("#inspector").on("touch", (e) => {
    e.preventDefault();
    $("#inspector").removeClass("active");
  });


  // item bindings
  $(".inspector").on({
    // mouseenter: (e) => {
    //   console.log(e);
    //   inspector.mouseover = true;
    //   inspector.view($(e.currentTarget).data("hash"));
    // },
    // mouseleave: (e) => {
    //   inspector.mouseover = false;
    //   $("#inspector").removeClass("active");
      
    //   // ...
    //   if (inspector.request) {
    //     if (inspector.request.readyState > 0 && inspector.request.readyState < 4) {
    //       inspector.request.abort();
    //     }
    //   }
    // },
    click: (e) => {
      inspector.mouseover = true;
      inspector.view($(e.currentTarget).data("hash"));
    }
  });

}

inspector();

inspector.view = (hash) => {

  // ...
  if (inspector.request) {
    if (inspector.request.readyState > 0 && inspector.request.readyState < 4) {
      inspector.request.abort();
    }
  }

  inspector.request = $.ajax({
    url: "https://api.braytech.org/?request=manifest&table=DestinyInventoryItemDefinition&hash=" + hash,
    method: "get",
    cache: true,
    dataType: "json",
    headers: {
      "X-Api-Key": apiKey.braytech
    }
  }).then();

  $.when(inspector.request).then((response) => {

    var item = response.response.data.items[0];
    console.log(item);

    var weaponsDefinition = [
      {
        "hash": "2837207746",
        "name": "Swing Speed",
        "type": "bar"
      },
      {
        "hash": "3614673599",
        "name": "Blast Radius",
        "type": "bar"
      },
      {
        "hash": "2523465841",
        "name": "Velocity",
        "type": "bar"
      },
      {
        "hash": "4043523819",
        "name": "Impact",
        "type": "bar"
      },
      {
        "hash": "1240592695",
        "name": "Range",
        "type": "bar"
      },
      {
        "hash": "2762071195",
        "name": "Efficiency",
        "type": "bar"
      },
      {
        "hash": "209426660",
        "name": "Defence",
        "type": "bar"
      },
      {
        "hash": "155624089",
        "name": "Stability",
        "type": "bar"
      },
      {
        "hash": "943549884",
        "name": "Handling",
        "type": "bar"
      },
      {
        "hash": "4188031367",
        "name": "Reload Speed",
        "type": "bar"
      },
      {
        "hash": "925767036",
        "name": "Ammo Capacity",
        "type": "int"
      },
      {
        "hash": "4284893193",
        "name": "Rounds Per Minute",
        "type": "int"
      },
      {
        "hash": "2961396640",
        "name": "Charge Time",
        "type": "int"
      },
      {
        "hash": "3871231066",
        "name": "Magazine",
        "type": "int"
      }
    ];

    var armorDefinition = [ 
      {
        "hash": "2996146975",
        "name": "Mobility",
        "type": "bar"
      },
      {
        "hash": "392767087",
        "name": "Resilience",
        "type": "bar"
      },
      {
        "hash": "1943323491",
        "name": "Recovery",
        "type": "bar"
      }
    ]

    var armorModifiers = {
      "2996146975": 0,
      "392767087": 0,
      "1943323491": 0
    }

    var weaponStats = "";
    weaponsDefinition.forEach(stat => {
      if (Object.keys(item.stats.stats).includes(stat.hash)) {
        weaponStats = weaponStats + `<div class="stat">
          <div class="name">${ stat.name }</div>
          <div class="value ${ stat.type }">
            ${ stat.type == "bar" ? `<div class="bar" data-value="${ item.stats.stats[stat.hash].value }" style="width:${ item.stats.stats[stat.hash].value }%;"></div>` : item.stats.stats[stat.hash].value }
          </div>
        </div>`;
      }
    });

    var armorStats = "";
    if (item.itemType == 2) {
      item.sockets.socketEntries.forEach(socket => {
        if (socket.socketTypeHash == 4076485920) {
          socket.reusablePlugItems.forEach(plug => {
            if (plug.hash == socket.singleInitialItemHash) {
              plug.investmentStats.forEach(investmentStat => {
                armorModifiers[investmentStat.statTypeHash]++;
              });
            }
          });
        }
      });
      armorDefinition.forEach(stat => {
        armorStats = armorStats + `<div class="stat">
          <div class="name">${ stat.name }</div>
          <div class="value ${ stat.type }">
            ${ stat.type == "bar" ? `<div class="bar" data-value="${ (item.stats.stats[stat.hash] ? item.stats.stats[stat.hash].value : 0) + (Object.keys(armorModifiers).includes(stat.hash) ? armorModifiers[stat.hash] : 0) }" style="width:${ ((item.stats.stats[stat.hash] ? item.stats.stats[stat.hash].value : 0) + (Object.keys(armorModifiers).includes(stat.hash) ? armorModifiers[stat.hash] : 0)) / 3 * 100 }%;"></div>` : (item.stats.stats[stat.hash] ? item.stats.stats[stat.hash].value : 0) }
          </div>
        </div>`;
      });
    }

    var socketIndexes;
    Object.keys(item.sockets.socketCategories).forEach(key => {
      if (item.sockets.socketCategories[key].socketCategoryHash == 4241085061 || item.sockets.socketCategories[key].socketCategoryHash == 2518356196) {
        socketIndexes = item.sockets.socketCategories[key].socketIndexes;
        return;
      }
    });

    var intrinsic = false;
    var traits = false;
    Object.values(socketIndexes).forEach(key => {
      var socket = item.sockets.socketEntries[key];
      if (socket.socketTypeHash == 1282012138) {
        return;
      }
      var plugs = ``;
      socket.reusablePlugItems.forEach((plug) => {
        if (plug.itemCategoryHashes.includes(2237038328)) {
          intrinsic = plug.perks[0].perkDef;
        }
      });
      if (socket.socketTypeHash == 2614797986) {
        if (item.itemType == 3) {
          if (!traits) {
            traits = "";
          }
          socket.reusablePlugItems.forEach((plug) => {
            if (socket.singleInitialItemHash == plug.hash) {
              traits = traits + `<div class="plug trait">
                <div class="icon image" data-1x="https://www.bungie.net${ plug.displayProperties.icon }" data-2x="https://www.bungie.net${ plug.displayProperties.icon }"></div>
                <div class="text">
                  <div class="name">${ plug.displayProperties.name }</div>
                  <div class="description">${ plug.displayProperties.description }</div>
                </div>
              </div>`;
            }
          });
        }
      }
    });
    
    $("#inspector").html(`<div class="window">
      <div class="acrylic"></div>
      <div class="frame">
        <div class="header ${ item.inventory.tierTypeName.toLowerCase() }">
          <div class="name">${ item.displayProperties.name }</div>
          <div>
            <div class="kind">${ item.itemTypeDisplayName }</div>
            <div class="rarity">${ item.inventory.tierTypeName }</div>
          </div>
        </div>
        <div class="black">
          ${ item.itemType == 3 ? `<div class="damage weapon">
            <div class="power ${ domain.utils.damageTypeToString(item.damageTypeHashes[0]).toLowerCase() }">
              <div class="icon destiny-damage_${ domain.utils.damageTypeToString(item.damageTypeHashes[0]).toLowerCase() }"></div>
              <div class="text">600</div>
            </div>
            <div class="slot">
              <div class="icon destiny-ammo_${ domain.utils.ammoTypeToString(item.equippingBlock.ammoType).toLowerCase() }"></div>
              <div class="text">${ domain.utils.ammoTypeToString(item.equippingBlock.ammoType) }</div>
            </div>
          </div>` : `<div class="damage armor">
            <div class="power">
              <div class="text">600</div>
              <div class="text">Defense</div>
            </div>
          </div>` }
          ${ item.sourceHash ? `<div class="source">
            <p>${ item.sourceString }</p>
          </div>` : `` }
          <div class="stats">
            ${ item.itemType == 3 ? weaponStats : armorStats }
          </div>
          <div class="sockets${ traits ? ` hasTraits` : `` }">
            ${ intrinsic ? `<div class="plug intrinsic">
              <div class="icon image" data-1x="https://www.bungie.net${ intrinsic.displayProperties.icon }" data-2x="https://www.bungie.net${ intrinsic.displayProperties.icon }"></div>
              <div class="text">
                <div class="name">${ intrinsic.displayProperties.name }</div>
                <div class="description">${ intrinsic.displayProperties.description }</div>
              </div>
            </div>` : `` }
            ${ traits ? traits : `` }
          </div>
        </div>
      </div>
    </div>`);
    
    // hacky fix for a sometimes only bug
    if (inspector.mouseover) {
      $("#inspector").addClass("active");
    }

    // load images dynamically
    // to do: 
    domain.sentinel("#inspector");

  });
}