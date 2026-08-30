(async function() {
    const url = 'https://snack-feeds.b-cdn.net/bet365/feeds/premier-league-enhanced.xml';
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const xmlText = await response.text();
        const xmlDoc = new DOMParser().parseFromString(xmlText, "text/xml");
        
        document.getElementById('status').style.display = 'none';
        
        const container = document.getElementById('box1-container');
        const events = xmlDoc.getElementsByTagName("Event"); 
        
        if (events.length === 0) return;

        let htmlContent = '';

        for (let i = 0; i < events.length; i++) {
            const eventNode = events[i];
            let eventName = eventNode.getAttribute("Name") || eventNode.getAttribute("name") || "Unknown Event";
            
            // Filter: Only include events containing "TEAM_NAME"
            if (!eventName.toLowerCase().includes("arsenal")) continue;

            const startTime = eventNode.getAttribute("StartTime");
            let formattedName = eventName.replace(/\s+v\s+/i, ' <span class="vs">v</span> ');
            
            const markets = eventNode.getElementsByTagName("Market");
            
            if (markets.length > 0) {
                const marketNode = markets[0]; 
                const marketName = marketNode.getAttribute("Name") || marketNode.getAttribute("name") || "Market";
                const participants = marketNode.getElementsByTagName("Participant");
                
                let labels = ["HOME", "DRAW", "AWAY"];
                let odds = ["-", "-", "-"];
                
                let homeFound = false;
                for (let k = 0; k < participants.length; k++) {
                    const p = participants[k];
                    const pName = p.getAttribute("Name") || p.getAttribute("name") || "";
                    const pOdds = p.getAttribute("Odds") || p.getAttribute("odds") || "-";
                    
                    if (pName.toLowerCase() === "draw" || pName.toLowerCase() === "x") {
                        odds[1] = pOdds;
                    } else if (!homeFound) {
                        odds[0] = pOdds;
                        homeFound = true;
                    } else {
                        odds[2] = pOdds;
                    }
                }

                htmlContent += `
                    <div class="promo-card" style="margin-bottom: 40px;">
                        <div class="match-title">${formattedName}</div>
                        <div class="timer-display" data-starttime="${startTime}">Loading timer...</div>
                        <div class="main-market">${marketName}</div>
                        <div class="odds-section">
                            <div class="odd-container">
                                <div class="odd-label" title="${labels[0]}">${labels[0]}</div>
                                <div class="new-odds">${odds[0]}</div>
                            </div>
                            <img src="arrow.gif" class="odds-icon" />
                            <div class="odd-container">
                                <div class="odd-label" title="${labels[1]}">${labels[1]}</div>
                                <div class="new-odds">${odds[1]}</div>
                            </div>
                            <img src="arrow.gif" class="odds-icon" />
                            <div class="odd-container">
                                <div class="odd-label" title="${labels[2]}">${labels[2]}</div>
                                <div class="new-odds">${odds[2]}</div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        container.innerHTML = htmlContent;
        
        // Start Timer specifically for Box 1
        setInterval(() => {
            const timerEls = container.querySelectorAll('.timer-display');
            timerEls.forEach(timerEl => {
                const timeStr = timerEl.getAttribute('data-starttime');
                if (!timeStr) return;
                
                const [datePart, timePart] = timeStr.split(' ');
                const [day, month, shortYear] = datePart.split('/');
                const [hour, minute, second] = timePart.split(':');
                const year = "20" + shortYear; 
                
                const eventDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
                const now = new Date();
                const diff = eventDate - now;
                
                if (diff <= 0) {
                    timerEl.innerText = "Match Started";
                    timerEl.style.color = "#ff6b6b";
                } else {
                    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
                    const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
                    const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
                    
                    const dayLabel = d === 1 ? 'Day' : 'Days';
                    
                    timerEl.innerText = `${d} ${dayLabel} ${h}:${m}:${s} to kick off`;
                }
            });
        }, 1000);
        
    } catch (error) {
        console.error("Box 1 Error:", error);
    }
})();