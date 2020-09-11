use crate::handle;
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Debug, Clone, Copy)]
pub enum State {
    K,
    TenK,
    Cleared,
}

impl Default for State {
    fn default() -> Self {
        State::Cleared
    }
}
#[derive(Debug, Clone, Copy)]
pub enum Actions {
    CreateK,
    CreateTenK,
    Clear,
}
#[derive(Debug, Default, Clone)]
pub struct Main {
    id: String,
    state: State,
    counter: usize,
    words: Vec<String>,
}

impl Main {
    pub fn create() -> handle::Handle<Self> {
        let main = Main {
            id: "main".to_owned(),
            counter: 0,
            state: State::Cleared,
            words: vec![
                "There".to_owned(),
                "High".to_owned(),
                "Lizards".to_owned(),
                "Sappy".to_owned(),
                "Wreck".to_owned(),
                "Fairly".to_owned(),
                "Barking".to_owned(),
                "Lurching".to_owned(),
                "Carbs".to_owned(),
                "Flat".to_owned(),
                "Hard".to_owned(),
                "Sad".to_owned(),
                "Butterfly".to_owned(),
                "Bandana".to_owned(),
            ],
        };
        handle::Handle(Rc::new(RefCell::new(main)))
    }
}

impl rust_fel::Component for handle::Handle<Main> {
    type Properties = ();
    type Message = Actions;
    type State = ();

    fn add_props(&mut self, _props: Self::Properties) {}

    fn reduce_state(&mut self, message: Self::Message) {
        match message {
            Actions::CreateK => self.0.borrow_mut().state = State::K,
            Actions::CreateTenK => self.0.borrow_mut().state = State::TenK,
            Actions::Clear => self.0.borrow_mut().state = State::Cleared,
        }
        self.0.borrow_mut().counter += 1;
        rust_fel::re_render(self.render(), Some(self.0.borrow().id.clone()));
    }

    fn render(&self) -> rust_fel::Element {
        let borrow = self.0.borrow_mut();
        let state = borrow.state;
        let mut el = None;
        let counter = borrow.counter;

        match state {
            State::K => {
                let mut main_table = rust_fel::html("<table></table>".to_owned());
                let mut table_body = rust_fel::html("<tbody></tbody>".to_owned());
                let mut table_rows = vec![];

                for num in 0..1000 {
                    let t = match table_rows.len() {
                        x if x > 14 => x + counter,
                        x if x <= 14 => x + 14 + counter,
                        _ => 0,
                    };
                    table_rows.push(rust_fel::html(format!(
                        "<tr><td>{}</td><td>{} {} {}</td></tr>",
                        num + 1,
                        borrow.words[t % 12],
                        borrow.words[t % 13],
                        borrow.words[t % 14],
                    )));
                }
                table_body.props.children = Some(table_rows);
                main_table.props.children = Some(vec![table_body]);
                el = Some(main_table);
            }
            State::TenK => {
                let mut main_table = rust_fel::html("<table></table>".to_owned());
                let mut table_body = rust_fel::html("<tbody></tbody>".to_owned());
                let mut table_rows = vec![];
                for num in 0..10000 {
                    let t = match table_rows.len() {
                        x if x > 14 => x + counter,
                        x if x <= 14 => x + 14 + counter,
                        _ => 0,
                    };
                    table_rows.push(rust_fel::html(format!(
                        "<tr><td>{}</td><td>{} {} {}</td></tr>",
                        num + 1,
                        borrow.words[t % 12],
                        borrow.words[t % 13],
                        borrow.words[t % 14],
                    )));
                }
                table_body.props.children = Some(table_rows);
                main_table.props.children = Some(vec![table_body]);
                el = Some(main_table);
            }
            State::Cleared => (),
        }

        let heading = rust_fel::html("<h1>rust-fel bench</h1>".to_owned());

        let mut clone = self.clone();
        let create_k_button = rust_fel::Element::new(
            "button".to_owned(),
            rust_fel::Props {
                id: Some("create1000".to_owned()),
                text: Some("Create 1K".to_owned()),
                on_click: Some(Box::new(move || clone.reduce_state(Actions::CreateK))),
                ..Default::default()
            },
        );

        let mut clone = self.clone();
        let create_ten_k_button = rust_fel::Element::new(
            "button".to_owned(),
            rust_fel::Props {
                id: Some("create10000".to_owned()),
                text: Some("Create 10K".to_owned()),
                on_click: Some(Box::new(move || clone.reduce_state(Actions::CreateTenK))),
                ..Default::default()
            },
        );

        let mut clone = self.clone();
        let clear = rust_fel::Element::new(
            "button".to_owned(),
            rust_fel::Props {
                id: Some("clear".to_owned()),
                text: Some("Clear".to_owned()),
                on_click: Some(Box::new(move || clone.reduce_state(Actions::Clear))),
                ..Default::default()
            },
        );

        let header = rust_fel::Element::new(
            "header".to_owned(),
            rust_fel::Props {
                children: Some(vec![heading, create_k_button, create_ten_k_button, clear]),
                ..Default::default()
            },
        );

        let mut children = vec![header];
        if let Some(x) = el {
            children.push(x);
        }
        rust_fel::Element::new(
            "div".to_owned(),
            rust_fel::Props {
                id: Some(borrow.id.clone()),
                class_name: Some("main".to_owned()),
                children: Some(children),
                ..Default::default()
            },
        )
    }
}
