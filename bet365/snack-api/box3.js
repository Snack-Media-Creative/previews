// File 2: First Goalscorer Subs (from source 5)
(async function() {
    const url = 'https://snack-feeds.b-cdn.net/bet365/feeds/premier-league-correct-score.xml';
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const xmlText = await response.text();
        const xmlDoc = new DOMParser().parseFromString(xmlText, "text/xml");
        
        const container = document.getElementById('box3-container');
        const events = xmlDoc.getElementsByTagName("Event"); 
        
        if (events.length === 0) return;

        let htmlContent = '';

        for (let i = 0; i < events.length; i++) {
            const eventNode = events[i];
            let eventName = eventNode.getAttribute("Name") || eventNode.getAttribute("name") || "Unknown Event";
            
            // Filter: Only include events containing "TEAM_NAME"
            if (!eventName.toLowerCase().includes("arsenal")) continue;

            let formattedName = eventName.replace(/\s+v\s+/i, ' <span class="vs">v</span> ');
            
            const markets = eventNode.getElementsByTagName("Market");
            
            if (markets.length > 0) {
                const marketNode = markets[0]; 
                const marketName = marketNode.getAttribute("Name") || marketNode.getAttribute("name") || "Market";
                const participants = marketNode.getElementsByTagName("Participant");
                
                let playersHtml = '';

                for (let k = 0; k < participants.length; k++) {
                    const p = participants[k];
                    const pName = p.getAttribute("Name") || p.getAttribute("name") || `Player ${k+1}`;
                    const pOdds = p.getAttribute("Odds") || p.getAttribute("odds") || "-";
                    
                    playersHtml += `
                        <div class="bb-item">
                            <div class="bb-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="#6df2a5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <div class="bb-info">
                                
                                <div class="bb-market">${marketName}</div>
                                <div class="bb-name">${pName}<span class="bb-player-odds"> ${pOdds}</span></div>
                            </div>
                        </div>
                    `;
                }

                // Modified: Apply a scrollable max-height if there are more than 5 participants
                let scrollStyle = participants.length > 5 ? 'style="max-height: 380px; overflow-y: auto; padding-right: 10px;"' : '';

                htmlContent += `
                    <div class="bet-builder-card" style="margin-bottom: 40px;">
                        <div class="bb-main-title">
                            <span class="white-text">BET</span> <span class="green-text">BUILDER</span>
                        </div>
                        <div class="bb-header">
                            <div class="bb-title">${formattedName}</div>
                        </div>
                        <div class="bb-list" ${scrollStyle}>
                            ${playersHtml}
                        </div>
                    </div>
                `;
            }
        }

        container.innerHTML = htmlContent;

    } catch (error) {
        console.error("Box 3 Error:", error);
    }
})();