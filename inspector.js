inspector = (options) => {

  // apiKey for api.braytech.org (to do)

  if (!inspector.init) {

    inspector.init = true;

    var inspectorWindow = document.createElement('div');
    inspectorWindow.setAttribute("id", "inspector");
    document.body.appendChild(inspectorWindow);

    inspector.options = options !== undefined ? options : {
      apiKey: "5afbd2ad6cb41",
      inspectorWindowOffset: 0,
      showHiddenStats: false
    }

  }

  inspector.bind();

}

inspector.bind = () => {

  var inspectorWindow = document.querySelector("#inspector");
  var inspectorItems = document.querySelectorAll(".inspector");

  // bind #inspector mouse position
  mouseMove = (e) => {

    var x = 0;
    var y = 0;
    offset = inspector.options.inspectorWindowOffset;
    var inspectorWidth = 384;
    var scrollbarAllowance = 24;

    x = e.clientX;
    y = e.clientY + offset;

    if (x + inspectorWidth + scrollbarAllowance > window.innerWidth) {
      x = x - inspectorWidth - offset;
    }
    else {
      x = x + offset;
    }
    
    inspectorWindow.style.cssText = `top: ${ y }px; left: ${ x }px`;
    
  }
  window.addEventListener("mousemove", mouseMove);
  
  // if touch primary input, close window on "touch"
  inspectorWindow.addEventListener("touchstart", (e) => {
    inspectorWindow.data = { moved: false };
  });
  inspectorWindow.addEventListener("touchmove", (e) => {
    inspectorWindow.data = { moved: true };
  });
  inspectorWindow.addEventListener("touchend", (e) => {
    if (!inspectorWindow.data.moved) {
      inspectorWindow.classList.remove("active");
    }
  });


  // item bindings
  inspectorItems.forEach(item => {
    item.addEventListener("mouseenter", (e) => {
      inspector.mouseover = true;
      inspector.view(e.currentTarget.getAttribute("data-hash"));
    });
    item.addEventListener("mouseout", (e) => {
      inspector.mouseover = false;
      inspectorWindow.classList.remove("active");
      
      // ...
      if (inspector.request) {
        if (inspector.request.readyState > 0 && inspector.request.readyState < 4) {
          inspector.request.abort();
        }
      }
    });
    item.addEventListener("click", (e) => {
      inspector.mouseover = true;
      inspector.view(e.currentTarget.getAttribute("data-hash"));
    });
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
      "X-Api-Key": inspector.options.apiKey
    }
  }).then();

  $.when(inspector.request).then((response) => {

    var item = response.response.data.items[0];

    if (item.itemType == 2 || item.itemType == 3) {

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
          "hash": "1345609583",
          "name": "Aim Assistance",
          "type": "bar",
          "hidden": true
        },
        {
          "hash": "2715839340",
          "name": "Recoil Direction",
          "type": "bar",
          "hidden": true
        },
        {
          "hash": "3555269338",
          "name": "Zoom",
          "type": "bar",
          "hidden": true
        },
        {
          "hash": "1931675084",
          "name": "Inventory Size",
          "type": "bar",
          "hidden": true
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
        if (stat.hidden && !inspector.options.showHiddenStats) {
          return;
        }
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
    }
    
    var inspectorWindow = document.querySelector("#inspector");

    switch (item.itemType) {
      case 2:
      case 3:
        inspectorWindow.innerHTML = `<div class="window">
          <div class="acrylic"></div>
          <div class="frame ${ item.inventory.tierTypeName.toLowerCase() }">
            <div class="header">
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
        </div>`;
        break;
      default:
        inspectorWindow.innerHTML = `<div class="window">
          <div class="acrylic"></div>
          <div class="frame ${ item.inventory.tierTypeName.toLowerCase() }">
            <div class="header">
              <div class="name">${ item.displayProperties.name }</div>
              <div>
                <div class="kind">${ item.itemTypeDisplayName }</div>
                <div class="rarity">${ item.inventory.tierTypeName }</div>
              </div>
            </div>
            <div class="black">
              <div class="description">
                <pre>${ item.displayProperties.description }</pre>
              </div>
            </div>
          </div>
        </div>`;
    }
    
    // hacky fix for a sometimes only bug
    if (inspector.mouseover) {
      inspectorWindow.classList.add("active");
    }

    // load images dynamically
    // to do: 
    domain.sentinel("#inspector");

  });
}