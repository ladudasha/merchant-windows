import AccordionPlagin from './../libs/accordion-plagin.min.js';

export default function accordion() {
    const accordion = new AccordionPlagin('.accordion', '.accordion div', '.accordion p', 'active', 'active', {
        initialActiveItem: true,
        initialActiveItemIndex: 0,
        anyActiveItems: true,
        itemPaddingTop: 10,
        itemPaddingBottom: 20
    });

    accordion.accordInit();
}
