let globalXmlDoc = null;

        // Where a card links to when its market has no betslip URL
        const FALLBACK_URL = 'https://bet365.com/?utm_source=snackmedia';

        function escapeAttr(value) {
            return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
        }

        document.addEventListener("DOMContentLoaded", () => {
            const dashboard = document.getElementById('dashboard');

            // Fetches data from the live XML feed
            fetch('https://snack-feeds.b-cdn.net/bet365/feeds/snack-next-bet-builder.xml')
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    return response.text();
                })
                .then(xmlString => {
                    const parser = new DOMParser();
                    globalXmlDoc = parser.parseFromString(xmlString, "text/xml");
                    
                    // 'Name of team to filter', leave empty for default maxCards
                    renderDashboard('', 1);
                })
                .catch(error => {
                    console.error('Error fetching or parsing XML:', error);
                    dashboard.innerHTML = `
                        <div class="error">
                            <strong>Failed to load the XML feed.</strong><br>
                            If you are viewing this locally, your browser may be blocking the request due to CORS (Cross-Origin Resource Sharing) restrictions.<br>
                            Error details: ${error.message}
                        </div>
                    `;
                });
        });

        // Function to shuffle an array
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        // Updated function takes a filterText and an optional maxCards limit
        function renderDashboard(filterText, maxCards = 10) {
            const dashboard = document.getElementById('dashboard');
            dashboard.innerHTML = ''; 
            
            if (!globalXmlDoc) return;

            // Get all events
            const events = Array.from(globalXmlDoc.getElementsByTagName('Event'));
            let allMarkets = [];

            // Collect all markets that match the filter
            for (let i = 0; i < events.length; i++) {
                const eventNode = events[i];
                let rawName = eventNode.getAttribute('Name') || '';

                if (filterText !== 'All' && filterText !== '' && !rawName.includes(filterText)) {
                    continue; 
                }

                const markets = eventNode.getElementsByTagName('Market');
                for (let j = 0; j < markets.length; j++) {
                    allMarkets.push({
                        eventNode: eventNode,
                        marketNode: markets[j],
                        rawName: rawName
                    });
                }
            }
            
            // Randomize the order of ALL markets globally
            allMarkets = shuffleArray(allMarkets);

            let cardsRendered = 0;

            for (let i = 0; i < allMarkets.length; i++) {
                if (cardsRendered >= maxCards) break;

                const { eventNode, marketNode, rawName } = allMarkets[i];
                let formattedName = rawName.replace(' v ', ' <span class="v">v</span> ');
                
                const marketName = marketNode.getAttribute('Name');
                const marketUnBoosted = marketNode.getAttribute('UnBoostedOdds');
                const marketOdds = marketNode.getAttribute('Odds');
                const marketOddsDecimal = marketNode.getAttribute('OddsDecimal');
                const betslipUrl = marketNode.getAttribute('betslip') || FALLBACK_URL;
                
                const displayOdds = marketOdds ? marketOdds : '';
                
                let participantsHtml = '';
                const participants = marketNode.getElementsByTagName('Participant');

                let calculatedReturn = "--";
                let oddsForCalculation = marketOddsDecimal; 

                if (participants.length > 0) {
                    for (let k = 0; k < participants.length; k++) {
                        const pName = participants[k].getAttribute('Name');
                        const pOdds = participants[k].getAttribute('Odds');
                        
                        // If marketOddsDecimal is empty/falsy, fallback to the participant's odds
                        if (!oddsForCalculation) {
                            oddsForCalculation = pOdds;
                        }

                        participantsHtml += `
                            <div class="selection-item">
                                <div class="check-icon">
                                    <svg viewBox="0 0 24 24">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <span>${pName}</span>
                            </div>
                        `;
                    }

                    // Evaluate calculatedReturn now that we have our final oddsForCalculation
                    if (oddsForCalculation) {
                        if (oddsForCalculation.includes('/')) {
                            // Fallback logic in case pOdds represents a fraction (e.g. 5/1)
                            const [num, den] = oddsForCalculation.split('/');
                            const decimalOdds = (parseFloat(num) / parseFloat(den)) + 1;
                            calculatedReturn = (10 * decimalOdds).toFixed(2);
                        } else if (!isNaN(parseFloat(oddsForCalculation))) {
                            const returnVal = 10 * parseFloat(oddsForCalculation);
                            calculatedReturn = returnVal.toFixed(2);
                        }
                    }

                    const cardHtml = `
                    <a id="main-link" href="https://bet365.com/?utm_source=snackmedia" target="_blank" rel="noopener"></a>
                        <a class="bet-card" href="${escapeAttr(betslipUrl)}" target="_blank" rel="noopener">
                            <div class="card-content">
                                <div class="card-header">
                                    <h3 class="market-name"><spam style="color: #ffffff;">BET</spam> BUILDER</h3>
                                    <div class="odds-container">
                                        ${marketUnBoosted ? `<span class="unboosted-odds">${marketUnBoosted}</span>` : ''}
                                        <span class="main-odds">${displayOdds}</span>
                                    </div>
                                </div>
                                <hr class="divider">
                                
                                <div class="event-name">${formattedName}</div>
                                
                                <div class="selections-list">
                                    ${participantsHtml}
                                </div>
                            </div>
                            
                            <div class="card-footer">
                                <div class="footer-col">
                                    <span class="footer-label">Stake</span>
                                    <span class="footer-val">£10.00</span>
                                </div>
                                <div class="footer-col">
                                    <span class="footer-label">To Return</span>
                                    <span class="footer-val">£${calculatedReturn}</span>
                                </div>
                            </div>
                        </a>
                    `;

                    dashboard.innerHTML += cardHtml;
                    cardsRendered++;
                }
            }

            if (cardsRendered === 0) {
                dashboard.innerHTML = `<div class="no-results">No markets found for ${filterText}.</div>`;
            }

            refreshAutoScrollLists();
        }

        // Selections lists that overflow ease to the bottom, hold there, then restart from the top
        const SCROLL_DURATION_MS = 5000;
        const SCROLL_HOLD_MS = 5000;
        let autoScrollLists = [];

        function refreshAutoScrollLists() {
            autoScrollLists = Array.from(document.querySelectorAll('.selections-list'))
                .filter(el => el.scrollHeight > el.clientHeight);
        }

        function autoScrollTick(now) {
            const elapsed = now % (SCROLL_DURATION_MS + SCROLL_HOLD_MS);
            const t = Math.min(elapsed / SCROLL_DURATION_MS, 1);
            const progress = (1 - Math.cos(t * Math.PI)) / 2;
            autoScrollLists.forEach(el => {
                el.scrollTop = progress * (el.scrollHeight - el.clientHeight);
            });
            requestAnimationFrame(autoScrollTick);
        }
        requestAnimationFrame(autoScrollTick);