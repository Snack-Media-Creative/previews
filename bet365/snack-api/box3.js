(async function() {
    const url = 'https://snack-feeds.b-cdn.net/bet365/feeds/premier-league-first-goalscorer-subs.xml';
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const xmlText = await response.text();
        const xmlDoc = new DOMParser().parseFromString(xmlText, "text/xml");
        
        const container = document.getElementById('box3-container');
        const events = xmlDoc.getElementsByTagName("Event"); 
        
        if (events.length === 0) return;

        const eventNode = events[0];
        let eventName = eventNode.getAttribute("Name") || eventNode.getAttribute("name") || "Unknown Event";
        eventName = eventName.replace(/\s+v\s+/i, ' <span class="vs">v</span> ');
        
        const markets = eventNode.getElementsByTagName("Market");
        
        if (markets.length > 0) {
            const marketNode = markets[0]; 
            const marketName = marketNode.getAttribute("Name") || marketNode.getAttribute("name") || "Market";
            const participants = marketNode.getElementsByTagName("Participant");
            
            let playersHtml = '';
            let firstOdds = "-";
            
            if (participants.length > 0) {
                firstOdds = participants[0].getAttribute("Odds") || participants[0].getAttribute("odds") || "-";
            }

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

            container.innerHTML = `
                <div class="bet-builder-card">
                    <div class="bb-main-title">
                        <span class="white-text">BET</span> <span class="green-text">BUILDER</span>
                    </div>
                    <div class="bb-header">
                        <div class="bb-title">${eventName}</div>
                    </div>
                    <div class="bb-list">
                        ${playersHtml}
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error("Box 3 Error:", error);
    }
})();