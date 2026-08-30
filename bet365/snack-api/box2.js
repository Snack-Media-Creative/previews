// File 1: First Goalscorer (from source 4)
(async function() {
    const url = 'https://snack-feeds.b-cdn.net/bet365/feeds/premier-league-first-goalscorer.xml';
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const xmlText = await response.text();
        const xmlDoc = new DOMParser().parseFromString(xmlText, "text/xml");
        
        const container = document.getElementById('box2-container');
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

                for (let k = 0; k < Math.min(7, participants.length); k++) {
                    const p = participants[k];
                    const pName = p.getAttribute("Name") || p.getAttribute("name") || `Player ${k+1}`;
                    const pOdds = p.getAttribute("Odds") || p.getAttribute("odds") || "-";
                    
                    playersHtml += `
                        <div class="bb-item">
                            <div class="bb-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="#6df2a5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <div class="bb-info">
                                <div class="bb-name"><span class="bb-player-odds">${pOdds}</span>${pName}</div>
                                <div class="bb-market">${marketName}</div>
                            </div>
                        </div>
                    `;
                }

                htmlContent += `
                    <div class="bet-builder-card" style="margin-bottom: 40px;">
                        <div class="bb-main-title">
                            <span class="white-text">BET</span> <span class="green-text">BUILDER</span>
                        </div>
                        <div class="bb-header">
                            <div class="bb-title">${formattedName}</div>
                        </div>
                        <div class="bb-list">
                            ${playersHtml}
                        </div>
                    </div>
                `;
            }
        }
        
        container.innerHTML = htmlContent;

    } catch (error) {
        console.error("Box 2 Error:", error);
    }
})();